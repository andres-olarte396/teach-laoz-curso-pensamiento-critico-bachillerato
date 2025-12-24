import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/AdminController.js';

export async function adminRoutes(fastify: FastifyInstance) {
  const controller = new AdminController();

  fastify.post('/admin/extract-courses', {
    schema: {
      tags: ['Admin'],
      summary: 'Trigger course extraction from repositories',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                cloned: { type: 'array', items: { type: 'string' } },
                updated: { type: 'array', items: { type: 'string' } },
                failed: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      error: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, controller.extractCourses.bind(controller));

  fastify.post('/admin/repositories', {
    schema: {
      tags: ['Admin'],
      summary: 'Add a new course repository',
      body: {
        type: 'object',
        required: ['name', 'url'],
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, controller.addRepository.bind(controller));

  fastify.get('/config', {
    schema: {
      tags: ['System'],
      summary: 'Get public system configuration',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                social: {
                  type: 'object',
                  properties: {
                    github: { type: 'string' },
                    twitter: { type: 'string' },
                    linkedin: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, controller.getConfig.bind(controller));
}
