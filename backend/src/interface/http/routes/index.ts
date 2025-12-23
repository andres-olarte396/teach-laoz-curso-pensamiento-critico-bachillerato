import { FastifyInstance } from 'fastify';
import { ContentController } from '../controllers/ContentController.js';

export async function contentRoutes(app: FastifyInstance) {
  const controller = new ContentController();

  // Menu Schema
  app.get('/menu', {
    schema: {
      tags: ['Content'],
      summary: 'Get course menu structure',
      response: {
        200: {
          type: 'object',
          properties: {
            courses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  path: { type: 'string' },
                  type: { type: 'string' },
                  children: { type: 'array', items: { type: 'object', additionalProperties: true } },
                },
              },
            },
          },
        },
      },
    },
  }, controller.getMenu.bind(controller));

  // Content Schema
  app.get('/content/*', {
    schema: {
      tags: ['Content'],
      summary: 'Get content by path',
      params: {
        type: 'object',
        properties: {
          '*': { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            content: { type: 'string' },
            html: { type: 'string' },
            metadata: { type: 'object' },
            frontmatter: { type: 'object' },
          },
        },
      },
    },
  }, controller.getContentByPath.bind(controller));
}
