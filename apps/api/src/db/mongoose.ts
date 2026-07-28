import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

mongoose.set('strictQuery', true);

export async function connectMongo(): Promise<void> {
  mongoose.connection.on('error', (error) => {
    logger.error({ err: error }, 'MongoDB connection error');
  });

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  });

  logger.info('Connected to MongoDB');
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
