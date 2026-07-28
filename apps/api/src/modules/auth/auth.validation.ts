import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  workspaceName: z.string().trim().min(2).max(100),
  industry: z.string().trim().max(60).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
