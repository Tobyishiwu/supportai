import { describe, expect, it } from 'vitest';
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  memberIdParamSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
} from './workspace.validation.js';

describe('createWorkspaceSchema', () => {
  it('accepts a minimal valid payload', () => {
    expect(() => createWorkspaceSchema.parse({ name: 'Acme Co' })).not.toThrow();
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(() => createWorkspaceSchema.parse({ name: 'A' })).toThrow();
  });
});

describe('updateWorkspaceSchema', () => {
  it('accepts an empty patch (all fields optional)', () => {
    expect(() => updateWorkspaceSchema.parse({})).not.toThrow();
  });

  it('rejects an invalid logoUrl', () => {
    expect(() => updateWorkspaceSchema.parse({ logoUrl: 'not-a-url' })).toThrow();
  });

  it('rejects an invalid billingEmail', () => {
    expect(() => updateWorkspaceSchema.parse({ billingEmail: 'nope' })).toThrow();
  });
});

describe('inviteMemberSchema', () => {
  it('accepts owner/agent roles and normalizes email', () => {
    const result = inviteMemberSchema.parse({ email: 'Agent@Example.com', roleName: 'agent' });
    expect(result.email).toBe('agent@example.com');
  });

  it('rejects an unrecognized role', () => {
    expect(() =>
      inviteMemberSchema.parse({ email: 'agent@example.com', roleName: 'admin' }),
    ).toThrow();
  });
});

describe('workspaceIdParamSchema / memberIdParamSchema', () => {
  const validId = '507f1f77bcf86cd799439011';

  it('accepts a valid 24-char hex ObjectId', () => {
    expect(() => workspaceIdParamSchema.parse({ workspaceId: validId })).not.toThrow();
  });

  it('rejects a malformed id', () => {
    expect(() => workspaceIdParamSchema.parse({ workspaceId: 'not-an-id' })).toThrow();
  });

  it('validates both ids on the extended member schema', () => {
    expect(() =>
      memberIdParamSchema.parse({ workspaceId: validId, memberId: 'bad' }),
    ).toThrow();
    expect(() =>
      memberIdParamSchema.parse({ workspaceId: validId, memberId: validId }),
    ).not.toThrow();
  });
});
