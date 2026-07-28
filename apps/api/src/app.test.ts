// These integration tests exercise the Express middleware chain end-to-end
// via supertest without a live MongoDB connection — every case here rejects
// (auth guard, validation, 404) or reports its own state (health check)
// before any route handler would issue a Mongoose query. They do assume a
// reachable Redis, same as local dev (`docker compose up -d`), since the
// global rate limiter is wired to a Redis-backed store for every request.
// `healthCheck`'s own branch coverage (healthy / mongo-down / redis-down)
// is unit-tested in isolation in `common/middleware/health-check.test.ts` —
// forcing the *real*, live Redis client's `.status` field here races its
// own internal reconnect logic and is not worth fighting.
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { redis } from './db/redis.js';

const app = createApp();

// The auth rate limiter's counters live in the same real Redis across test
// runs (20 req/15min); without clearing them, repeated `pnpm test` runs
// eventually see 429s here instead of the 422s these cases assert on.
beforeAll(async () => {
  const keys = await redis.keys('rl:auth:*');
  if (keys.length > 0) await redis.del(...keys);
});

// mongoose's types mark `readyState` read-only, but it's a plain writable
// instance property at runtime (mongoose itself assigns it on connect/close).
function setMongoReadyState(value: number): void {
  (mongoose.connection as unknown as { readyState: number }).readyState = value;
}

describe('GET /health', () => {
  it('reports 503/degraded when mongo is disconnected', async () => {
    const originalMongoState = mongoose.connection.readyState;
    setMongoReadyState(0);
    try {
      const res = await request(app).get('/health');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe('degraded');
      expect(res.body.dependencies.mongo).toBe('disconnected');
    } finally {
      setMongoReadyState(originalMongoState);
    }
  });
});

describe('auth guard', () => {
  it('rejects a protected route with no Authorization header', async () => {
    const res = await request(app).get('/api/v1/workspaces');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects a malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', 'not-a-bearer-token');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/invalid or expired/i);
  });

  it('rejects /auth/me with no token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('request validation', () => {
  it('rejects register with a missing required field', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'jane@example.com',
      password: 'password123',
      workspaceName: 'Acme Co',
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects register with an invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Jane Doe',
      email: 'not-an-email',
      password: 'password123',
      workspaceName: 'Acme Co',
    });
    expect(res.status).toBe(422);
  });

  it('rejects register with a too-short password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'short',
      workspaceName: 'Acme Co',
    });
    expect(res.status).toBe(422);
  });

  it('rejects login with an empty password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'jane@example.com', password: '' });
    expect(res.status).toBe(422);
  });
});

describe('404 fallback', () => {
  it('returns a JSON 404 for an unknown route', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
