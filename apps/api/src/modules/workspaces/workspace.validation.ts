import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  industry: z.string().trim().max(60).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  industry: z.string().trim().max(60).optional(),
  logoUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  billingEmail: z.string().email().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  roleName: z.enum(['owner', 'agent']),
});

export const updateMemberSchema = z.object({
  roleName: z.enum(['owner', 'agent']).optional(),
  status: z.enum(['active', 'removed']).optional(),
});

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid workspace id'),
});

export const memberIdParamSchema = workspaceIdParamSchema.extend({
  memberId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid member id'),
});
