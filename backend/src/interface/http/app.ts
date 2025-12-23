import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { env } from '../../infrastructure/config/environment.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { contentRoutes } from './routes/index.js';
import { authRoutes } from './routes/authRoutes.js';
import { blogRoutes } from './routes/blogRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import staticFiles from '@fastify/static';
import path from 'path';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

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
    credentials: true, // Needed for cookies
  });


  // Swagger (API Documentation)
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Teach LAOZ LMS API',
        description: 'Technical Learning Management System API',
        version: '0.1.0',
      },
      servers: [
        { url: 'http://localhost:3000' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'User authentication' },
        { name: 'Content', description: 'Course content management' },
        { name: 'Blog', description: 'Public blog posts' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/documentation',
  });

  // Auth Plugins
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  await app.register(cookie, {
    secret: env.JWT_SECRET, // for signing cookies
    hook: 'onRequest',
  });

  // Auth Decorator
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
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
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(blogRoutes, { prefix: '/api' });
  await app.register(adminRoutes, { prefix: '/api' });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}
