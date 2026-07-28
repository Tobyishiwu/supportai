import type { Request, Response } from 'express';
import { User } from '../../models/user.model.js';
import { AppError } from '../../common/errors/app-error.js';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.auth!.userId);
  if (!user) throw AppError.notFound('User not found');
  res.json({ data: user });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndUpdate(req.auth!.userId, req.body, { new: true });
  if (!user) throw AppError.notFound('User not found');
  res.json({ data: user });
}
