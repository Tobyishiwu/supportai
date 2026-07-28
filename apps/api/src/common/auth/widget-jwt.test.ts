import { describe, expect, it } from 'vitest';
import { signWidgetToken, verifyWidgetToken } from './widget-jwt.js';

describe('widget tokens', () => {
  it('round-trips workspace/customer/conversation claims', () => {
    const token = signWidgetToken({
      workspaceId: 'ws-1',
      customerId: 'cust-1',
      conversationId: 'conv-1',
    });
    const payload = verifyWidgetToken(token);
    expect(payload).toMatchObject({
      workspaceId: 'ws-1',
      customerId: 'cust-1',
      conversationId: 'conv-1',
    });
  });

  it('rejects a garbage token', () => {
    expect(() => verifyWidgetToken('garbage')).toThrow();
  });
});
