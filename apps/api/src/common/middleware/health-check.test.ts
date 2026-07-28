import { describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import mongoose from 'mongoose';

const fakeRedis = { status: 'wait' };
vi.mock('../../db/redis.js', () => ({ redis: fakeRedis }));

const { healthCheck } = await import('./health-check.js');

// mongoose's types mark `readyState` read-only, but it's a plain writable
// instance property at runtime (mongoose itself assigns it on connect/close).
function setMongoReadyState(value: number): void {
  (mongoose.connection as unknown as { readyState: number }).readyState = value;
}

function fakeRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

describe('healthCheck', () => {
  it('reports 200/ok when both mongo and redis are connected', () => {
    setMongoReadyState(1);
    fakeRedis.status = 'ready';

    const res = fakeRes();
    healthCheck({} as never, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      dependencies: { mongo: 'connected', redis: 'connected' },
    });
  });

  it('reports 503/degraded when mongo is disconnected', () => {
    setMongoReadyState(0);
    fakeRedis.status = 'ready';

    const res = fakeRes();
    healthCheck({} as never, res as unknown as Response);

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      status: 'degraded',
      dependencies: { mongo: 'disconnected', redis: 'connected' },
    });
  });

  it('reports 503/degraded when redis is disconnected', () => {
    setMongoReadyState(1);
    fakeRedis.status = 'wait';

    const res = fakeRes();
    healthCheck({} as never, res as unknown as Response);

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      status: 'degraded',
      dependencies: { mongo: 'connected', redis: 'disconnected' },
    });
  });
});
