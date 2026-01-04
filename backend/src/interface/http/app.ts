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
import { progressRoutes } from './routes/progressRoutes.js';
import { evaluationRoutes } from './routes/evaluationRoutes.js';
import { evidenceRoutes } from './routes/evidenceRoutes.js';
import { commentRoutes } from './routes/commentRoutes.js';
// import { aiRoutes } from '../../bounded-contexts/ai-evaluation/interface/http/routes.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import staticFiles from '@fastify/static';
import multipart from '@fastify/multipart';
import path from 'path';
import { uploadRoutes } from './routes/uploadRoutes.js';

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
    origin: (origin, cb) => {
      // Allow if origin is from CORS_ORIGIN or if it matches localhost/127 for dev
      if (!origin || origin === 'null') {
        cb(null, true);
        return;
      }
      
      const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
    sign: {
      expiresIn: '7d', // Session lasts 7 days
    },
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
    prefix: '/api/content-assets/',
    decorateReply: false,
  });

  // Static files for uploads
  await app.register(staticFiles, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/api/uploads/',
    decorateReply: false,
  });

  await app.register(multipart);

  // Routes
  await app.register(contentRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(blogRoutes, { prefix: '/api' });
  await app.register(adminRoutes, { prefix: '/api' });
  await app.register(progressRoutes, { prefix: '/api' });
  await evaluationRoutes(app); // evaluationRoutes registered with prefix inside the function to avoid double prefixing issue if any, but wait, previous code had { prefix: '/api/evaluations' } for evaluationRoutes.
  // Correcting pattern:
  await  app.register(evaluationRoutes, { prefix: '/api/evaluation' });
  app.register(evidenceRoutes, { prefix: '/api/evidence' });
  app.register(uploadRoutes, { prefix: '/api/uploads' });
  await app.register(commentRoutes, { prefix: '/api/comments' });
  // await app.register(aiRoutes, { prefix: '/api/ai' }); // Decoupled to microservice

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}
