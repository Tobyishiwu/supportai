import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../common/middleware/require-permission.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './ticket.controller.js';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema,
  workspaceIdParamSchema,
} from './ticket.validation.js';

export const ticketRouter = Router({ mergeParams: true });

ticketRouter.use(
  authenticate,
  validate({ params: workspaceIdParamSchema }),
  resolveWorkspace,
  requirePermission('tickets:manage'),
);

ticketRouter.get('/', validate({ query: listTicketsQuerySchema }), asyncHandler(controller.list));
ticketRouter.post('/', validate({ body: createTicketSchema }), asyncHandler(controller.create));
ticketRouter.get('/:ticketId', validate({ params: ticketIdParamSchema }), asyncHandler(controller.get));
ticketRouter.patch(
  '/:ticketId',
  validate({ params: ticketIdParamSchema, body: updateTicketSchema }),
  asyncHandler(controller.update),
);
