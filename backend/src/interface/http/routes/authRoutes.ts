import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { AuthService } from '../../../application/services/AuthService.js';
import { SQLiteUserRepository } from '../../../infrastructure/repositories/SQLiteUserRepository.js';

import { UpdateUser } from '../../../application/use-cases/user/UpdateUser.js';

export async function authRoutes(app: FastifyInstance) {
  const userRepository = new SQLiteUserRepository();
  const authService = new AuthService(userRepository);
  const updateUserUseCase = new UpdateUser(userRepository);
  const controller = new AuthController(authService, updateUserUseCase);

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

  // Update Profile Schema
  app.put('/auth/me', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Update current user profile',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          avatarUrl: { type: 'string' }
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
                avatarUrl: { type: 'string' }
              },
            },
          },
        },
      },
    },
  }, controller.update.bind(controller));

  // Change Password
  app.post('/auth/change-password', {
      onRequest: [app.authenticate],
      schema: {
          tags: ['Auth'],
          summary: 'Change password',
          body: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 6 }
              }
          },
          response: {
              200: {
                  type: 'object',
                  properties: {
                      message: { type: 'string' }
                  }
              }
          }
      }
  }, controller.changePassword.bind(controller));
}
