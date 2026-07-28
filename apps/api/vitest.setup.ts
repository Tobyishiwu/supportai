// Runs before any test file is loaded, so modules that read `env.ts` at
// import time (jwt.ts, widget-jwt.ts, etc.) see valid values instead of
// crashing the process via env.ts's `process.exit(1)` on invalid config.
process.env.NODE_ENV ??= 'test';
process.env.MONGODB_URI ??= 'mongodb://localhost:27017/supportai-test';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-min-32-characters-long';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-min-32-characters-long';
process.env.WIDGET_TOKEN_SECRET ??= 'test-widget-secret-min-32-characters-long';
