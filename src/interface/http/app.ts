import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../../infrastructure/config/environment.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { contentRoutes } from './routes/index.js';
import staticFiles from '@fastify/static';
import path from 'path';

/**
 * Configure and return the Fastify instance
 */
export async function createServer(): Promise<FastifyInstance> {
  const app = fastify({
    logger: false, // Using our centralized pino logger
  });

  // CORS configuration
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
  });

  // Global error handler
  app.setErrorHandler(errorHandler);

  // Static files for course assets (images, etc)
  await app.register(staticFiles, {
    root: path.resolve(env.CONTENT_BASE_PATH),
    prefix: '/assets/', // Assets prefix
    decorateReply: false,
  });

  // Routes
  await app.register(contentRoutes, { prefix: '/api' });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}
