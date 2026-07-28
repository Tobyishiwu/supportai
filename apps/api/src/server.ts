import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectMongo, disconnectMongo } from './db/mongoose.js';
import { connectRedis, disconnectRedis } from './db/redis.js';
import { seedPermissions } from './modules/workspaces/permissions.seed.js';
import { createApp } from './app.js';

async function main(): Promise<void> {
  await connectMongo();
  await connectRedis();
  await seedPermissions();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`SupportAI API listening on port ${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close();
    await Promise.all([disconnectMongo(), disconnectRedis()]);
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.error({ err: error }, 'Fatal error during startup');
  process.exit(1);
});
