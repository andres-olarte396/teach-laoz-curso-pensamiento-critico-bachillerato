import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { AuthService } from '../../../application/services/AuthService.js';
import { SQLiteUserRepository } from '../../../infrastructure/repositories/SQLiteUserRepository.js';

export async function authRoutes(app: FastifyInstance) {
  const userRepository = new SQLiteUserRepository();
  const authService = new AuthService(userRepository);
  const controller = new AuthController(authService);

  // Login Schema
  app.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login user',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, controller.login.bind(controller));

  // Register Schema
  app.post('/auth/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register new user',
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, controller.register.bind(controller));
  
  // Me Schema
  app.get('/auth/me', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Get current user',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, controller.me.bind(controller));
}
