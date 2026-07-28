import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../common/middleware/require-permission.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './workspace.controller.js';
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  memberIdParamSchema,
  updateMemberSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
} from './workspace.validation.js';

export const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter.post('/', validate({ body: createWorkspaceSchema }), asyncHandler(controller.createWorkspace));
workspaceRouter.get('/', asyncHandler(controller.listMyWorkspaces));

// Registered before `/:workspaceId` — otherwise that param route would swallow this literal path.
workspaceRouter.get('/invites', asyncHandler(controller.listMyInvites));

workspaceRouter.get(
  '/:workspaceId',
  validate({ params: workspaceIdParamSchema }),
  resolveWorkspace,
  asyncHandler(controller.getWorkspace),
);

workspaceRouter.patch(
  '/:workspaceId',
  validate({ params: workspaceIdParamSchema, body: updateWorkspaceSchema }),
  resolveWorkspace,
  requirePermission('settings:manage'),
  asyncHandler(controller.updateWorkspace),
);

workspaceRouter.get(
  '/:workspaceId/members',
  validate({ params: workspaceIdParamSchema }),
  resolveWorkspace,
  asyncHandler(controller.listMembers),
);

workspaceRouter.get(
  '/:workspaceId/roles',
  validate({ params: workspaceIdParamSchema }),
  resolveWorkspace,
  asyncHandler(controller.listRoles),
);

workspaceRouter.post(
  '/:workspaceId/members/invite',
  validate({ params: workspaceIdParamSchema, body: inviteMemberSchema }),
  resolveWorkspace,
  requirePermission('team:manage'),
  asyncHandler(controller.inviteMember),
);

// No resolveWorkspace here — the invited user isn't an *active* member yet,
// which is exactly what resolveWorkspace requires, so it must self-check status instead.
workspaceRouter.post(
  '/:workspaceId/members/accept',
  validate({ params: workspaceIdParamSchema }),
  asyncHandler(controller.acceptInvite),
);

workspaceRouter.patch(
  '/:workspaceId/members/:memberId',
  validate({ params: memberIdParamSchema, body: updateMemberSchema }),
  resolveWorkspace,
  requirePermission('team:manage'),
  asyncHandler(controller.updateMember),
);

workspaceRouter.delete(
  '/:workspaceId/members/:memberId',
  validate({ params: memberIdParamSchema }),
  resolveWorkspace,
  requirePermission('team:manage'),
  asyncHandler(controller.removeMember),
);
