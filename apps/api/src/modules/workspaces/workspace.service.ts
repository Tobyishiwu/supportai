import mongoose, { type Types } from 'mongoose';
import { Workspace, type WorkspaceDoc } from '../../models/workspace.model.js';
import { Role } from '../../models/role.model.js';
import { Permission, type PermissionKey } from '../../models/permission.model.js';
import { WorkspaceMember, type WorkspaceMemberDoc } from '../../models/workspace-member.model.js';
import { AISetting } from '../../models/ai-setting.model.js';
import { Subscription } from '../../models/subscription.model.js';
import { User } from '../../models/user.model.js';
import { AppError } from '../../common/errors/app-error.js';
import { slugify } from '../../common/utils/slugify.js';
import { env } from '../../config/env.js';
import { enqueueEmail } from '../email/email.queue.js';
import { renderInviteEmail } from '../email/templates/invite-email.js';
import { SYSTEM_ROLE_PERMISSIONS, type CreateWorkspaceInput, type InviteMemberInput } from './workspace.types.js';
import type { SystemRoleName } from '../../models/role.model.js';

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || 'workspace';
  let candidate = base;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Workspace.exists({ slug: candidate })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createWorkspaceForOwner(
  userId: string,
  input: CreateWorkspaceInput,
): Promise<{ workspace: WorkspaceDoc; membership: WorkspaceMemberDoc }> {
  const slug = await uniqueSlug(input.name);
  const session = await mongoose.startSession();

  try {
    let result: { workspace: WorkspaceDoc; membership: WorkspaceMemberDoc } | undefined;

    await session.withTransaction(async () => {
      const [workspace] = await Workspace.create(
        [{ name: input.name, slug, industry: input.industry ?? null }],
        { session },
      );
      if (!workspace) throw new Error('Failed to create workspace');

      const allPermissions = await Permission.find({}, undefined, { session });
      const permissionIdByKey = new Map(allPermissions.map((p) => [p.key, p._id]));

      const roleDocs = await Role.create(
        (Object.entries(SYSTEM_ROLE_PERMISSIONS) as [SystemRoleName, PermissionKey[]][]).map(
          ([name, keys]) => ({
            workspace: workspace._id,
            name,
            isSystem: true,
            permissions: keys
              .map((key) => permissionIdByKey.get(key))
              .filter((id): id is Types.ObjectId => id !== undefined),
          }),
        ),
        { session, ordered: true },
      );

      const ownerRole = roleDocs.find((r) => r.name === 'owner');
      if (!ownerRole) throw new Error('Owner role not created');

      const [membership] = await WorkspaceMember.create(
        [
          {
            workspace: workspace._id,
            user: userId,
            role: ownerRole._id,
            status: 'active',
            joinedAt: new Date(),
          },
        ],
        { session },
      );
      if (!membership) throw new Error('Failed to create membership');

      await AISetting.create([{ workspace: workspace._id }], { session });
      await Subscription.create([{ workspace: workspace._id }], { session });

      result = { workspace, membership };
    });

    if (!result) throw new Error('Workspace creation transaction produced no result');
    return result;
  } finally {
    await session.endSession();
  }
}

export async function listWorkspacesForUser(userId: string) {
  const memberships = await WorkspaceMember.find({ user: userId, status: 'active' })
    .populate('workspace')
    .populate({ path: 'role', populate: { path: 'permissions' } });
  return memberships;
}

export async function getActiveMembership(workspaceId: string, userId: string): Promise<WorkspaceMemberDoc | null> {
  return WorkspaceMember.findOne({ workspace: workspaceId, user: userId, status: 'active' }).populate({
    path: 'role',
    populate: { path: 'permissions' },
  });
}

export async function listMembers(workspaceId: string) {
  return WorkspaceMember.find({ workspace: workspaceId })
    .populate('user', 'name email avatarUrl status')
    .populate('role', 'name');
}

export async function listRoles(workspaceId: string) {
  return Role.find({ workspace: workspaceId }).populate('permissions', 'key description');
}

export async function inviteMember(
  workspaceId: string,
  invitedBy: string,
  input: InviteMemberInput,
): Promise<WorkspaceMemberDoc> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw AppError.notFound('No account exists with this email yet. Ask them to sign up first.');
  }

  const role = await Role.findOne({ workspace: workspaceId, name: input.roleName });
  if (!role) throw AppError.validation('Unknown role');

  const existing = await WorkspaceMember.findOne({ workspace: workspaceId, user: user._id });
  if (existing) throw AppError.conflict('This user is already a member of the workspace');

  const [workspace, inviter] = await Promise.all([
    Workspace.findById(workspaceId),
    User.findById(invitedBy),
  ]);

  const member = await WorkspaceMember.create({
    workspace: workspaceId,
    user: user._id,
    role: role._id,
    status: 'invited',
    invitedBy,
  });

  if (workspace && inviter) {
    const { subject, html } = renderInviteEmail({
      workspaceName: workspace.name,
      inviterName: inviter.name,
      roleName: input.roleName,
      acceptUrl: `${env.WEB_APP_URL}/dashboard/invites`,
    });
    await enqueueEmail({ to: user.email, subject, html });
  }

  return member;
}

export async function acceptInvite(workspaceId: string, userId: string): Promise<WorkspaceMemberDoc> {
  const member = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId, status: 'invited' });
  if (!member) throw AppError.notFound('No pending invite found for this workspace');

  member.status = 'active';
  member.joinedAt = new Date();
  await member.save();
  return member;
}

export async function listMyInvites(userId: string) {
  return WorkspaceMember.find({ user: userId, status: 'invited' })
    .populate('workspace', 'name slug logoUrl')
    .populate('role', 'name')
    .populate('invitedBy', 'name email');
}

export async function updateMember(
  workspaceId: string,
  memberId: string,
  updates: { roleName?: string; status?: 'active' | 'removed' },
): Promise<WorkspaceMemberDoc> {
  const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId });
  if (!member) throw AppError.notFound('Member not found');

  if (updates.roleName) {
    const role = await Role.findOne({ workspace: workspaceId, name: updates.roleName });
    if (!role) throw AppError.validation('Unknown role');
    member.role = role._id;
  }
  if (updates.status) {
    member.status = updates.status;
  }
  await member.save();
  return member;
}

export async function removeMember(workspaceId: string, memberId: string): Promise<void> {
  const result = await WorkspaceMember.updateOne(
    { _id: memberId, workspace: workspaceId },
    { status: 'removed' },
  );
  if (result.matchedCount === 0) throw AppError.notFound('Member not found');
}

export async function getWorkspaceById(workspaceId: string): Promise<WorkspaceDoc | null> {
  return Workspace.findById(workspaceId);
}

export async function updateWorkspace(
  workspaceId: string,
  updates: Partial<Pick<WorkspaceDoc, 'name' | 'industry' | 'logoUrl' | 'timezone' | 'billingEmail'>>,
): Promise<WorkspaceDoc> {
  const workspace = await Workspace.findByIdAndUpdate(workspaceId, updates, { new: true });
  if (!workspace) throw AppError.notFound('Workspace not found');
  return workspace;
}
