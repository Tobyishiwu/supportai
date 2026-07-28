import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../common/middleware/require-permission.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './knowledge.controller.js';
import {
  createDocumentSchema,
  createFaqSchema,
  documentIdParamSchema,
  workspaceIdParamSchema,
} from './knowledge.validation.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const knowledgeRouter = Router({ mergeParams: true });

knowledgeRouter.use(authenticate, validate({ params: workspaceIdParamSchema }), resolveWorkspace);

knowledgeRouter.get('/documents', asyncHandler(controller.listDocuments));

knowledgeRouter.post(
  '/documents',
  requirePermission('knowledge:manage'),
  upload.single('file'),
  validate({ body: createDocumentSchema }),
  asyncHandler(controller.createDocument),
);

knowledgeRouter.post(
  '/faqs',
  requirePermission('knowledge:manage'),
  validate({ body: createFaqSchema }),
  asyncHandler(controller.createFaq),
);

knowledgeRouter.delete(
  '/documents/:documentId',
  requirePermission('knowledge:manage'),
  validate({ params: documentIdParamSchema }),
  asyncHandler(controller.deleteDocument),
);
