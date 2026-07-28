import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './user.controller.js';
import { updateProfileSchema } from './user.validation.js';

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get('/me', asyncHandler(controller.getProfile));
userRouter.patch('/me', validate({ body: updateProfileSchema }), asyncHandler(controller.updateProfile));
