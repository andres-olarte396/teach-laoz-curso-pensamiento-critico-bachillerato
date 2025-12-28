import { FastifyInstance } from 'fastify';
import { ContentController } from '../controllers/ContentController.js';
import { ContactController } from '../controllers/ContactController.js';
import { DocController } from '../controllers/DocController.js';

export async function contentRoutes(app: FastifyInstance) {
  const controller = new ContentController();
  const docController = new DocController();

  // Test Route
  app.get('/ping', async () => ({ status: 'ok', message: 'pong', timestamp: new Date().toISOString() }));

  // Documentation Route
  console.log('[Routes] Registering /docs/:category/:docId');
  app.get('/docs/:category/:docId', {
    schema: {
      tags: ['Documentation'],
      summary: 'Get documentation article',
      params: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          docId: { type: 'string' }
        }
      }
    }
  }, docController.getDoc.bind(docController));

  // Contact Route
  app.post('/contact', {
    schema: {
      tags: ['Contact'],
      summary: 'Submit a contact message',
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          subject: { type: 'string', minLength: 3 },
          message: { type: 'string', minLength: 10 },
        },
        required: ['name', 'email', 'subject', 'message']
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
  }, ContactController.submit);

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

  // Courses List with Metadata
  app.get('/courses', {
    schema: {
      tags: ['Content'],
      summary: 'Get course list with full metadata',
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
                  summary: { type: 'string' },
                  author: { type: 'string' },
                  date: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  category: { type: 'string' },
                  level: { type: 'string' },
                  imageUrl: { type: 'string' },
                  published: { type: 'boolean' }
                },
              },
            },
          },
        },
      },
    },
  }, controller.listCourses.bind(controller));

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
            extension: { type: 'string' },
            content: { type: 'string' },
            html: { type: 'string' },
            metadata: { 
              type: 'object',
              properties: {
                size: { type: 'number' },
                lastModified: { type: 'string' },
                mimeType: { type: 'string' }
              },
              additionalProperties: true
            },
            frontmatter: { type: 'object', additionalProperties: true },
            relatedAssets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  path: { type: 'string' },
                  name: { type: 'string' },
                  url: { type: 'string' }
                }
              }
            }
          },
        },
      },
    },
  }, controller.getContentByPath.bind(controller));
}
