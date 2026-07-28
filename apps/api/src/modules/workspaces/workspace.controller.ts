import type { Request, Response } from 'express';
import * as workspaceService from './workspace.service.js';
import { recordAudit } from '../../common/utils/audit.js';
import { AppError } from '../../common/errors/app-error.js';

export async function createWorkspace(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.userId;
  const { workspace, membership } = await workspaceService.createWorkspaceForOwner(userId, req.body);
  await recordAudit({
    req,
    action: 'workspace.create',
    workspace: String(workspace._id),
    actor: userId,
    targetType: 'Workspace',
    targetId: String(workspace._id),
  });
  res.status(201).json({ data: { workspace, membership } });
}

export async function listMyWorkspaces(req: Request, res: Response): Promise<void> {
  const memberships = await workspaceService.listWorkspacesForUser(req.auth!.userId);
  res.json({ data: memberships });
}

export async function getWorkspace(req: Request, res: Response): Promise<void> {
  const workspace = await workspaceService.getWorkspaceById(req.workspaceId!);
  if (!workspace) throw AppError.notFound('Workspace not found');
  res.json({ data: workspace });
}

export async function updateWorkspace(req: Request, res: Response): Promise<void> {
  const workspace = await workspaceService.updateWorkspace(req.workspaceId!, req.body);
  await recordAudit({
    req,
    action: 'workspace.update',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'Workspace',
    targetId: req.workspaceId,
    metadata: { fields: Object.keys(req.body) },
  });
  res.json({ data: workspace });
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  const members = await workspaceService.listMembers(req.workspaceId!);
  res.json({ data: members });
}

export async function listRoles(req: Request, res: Response): Promise<void> {
  const roles = await workspaceService.listRoles(req.workspaceId!);
  res.json({ data: roles });
}

export async function inviteMember(req: Request, res: Response): Promise<void> {
  const member = await workspaceService.inviteMember(req.workspaceId!, req.auth!.userId, req.body);
  await recordAudit({
    req,
    action: 'workspace.member.invite',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'WorkspaceMember',
    targetId: String(member._id),
    metadata: { email: req.body.email, roleName: req.body.roleName },
  });
  res.status(201).json({ data: member });
}

export async function updateMember(req: Request, res: Response): Promise<void> {
  const member = await workspaceService.updateMember(req.workspaceId!, req.params.memberId!, req.body);
  await recordAudit({
    req,
    action: 'workspace.member.update',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'WorkspaceMember',
    targetId: req.params.memberId,
    metadata: req.body,
  });
  res.json({ data: member });
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  await workspaceService.removeMember(req.workspaceId!, req.params.memberId!);
  await recordAudit({
    req,
    action: 'workspace.member.remove',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'WorkspaceMember',
    targetId: req.params.memberId,
  });
  res.status(204).send();
}
