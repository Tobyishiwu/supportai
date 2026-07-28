import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../common/middleware/require-permission.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './customer.controller.js';
import { customerIdParamSchema, listCustomersQuerySchema, workspaceIdParamSchema } from './customer.validation.js';

export const customerRouter = Router({ mergeParams: true });

customerRouter.use(
  authenticate,
  validate({ params: workspaceIdParamSchema }),
  resolveWorkspace,
  requirePermission('conversations:view'),
);

customerRouter.get('/', validate({ query: listCustomersQuerySchema }), asyncHandler(controller.list));
customerRouter.get(
  '/:customerId',
  validate({ params: customerIdParamSchema }),
  asyncHandler(controller.get),
);
