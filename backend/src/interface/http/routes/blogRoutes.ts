import { FastifyInstance } from 'fastify';
import { BlogController } from '../controllers/BlogController.js';

export async function blogRoutes(fastify: FastifyInstance) {
  const controller = new BlogController();

  // List Posts Schema
  fastify.get('/blog/posts', {
    schema: {
      tags: ['Blog'],
      summary: 'List all published blog posts',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' },
              excerpt: { type: 'string' },
              date: { type: 'string' },
              author: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  }, controller.list.bind(controller));

  // Get Post Schema
  fastify.get('/blog/posts/:slug', {
    schema: {
      tags: ['Blog'],
      summary: 'Get a single blog post by slug',
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            slug: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            date: { type: 'string' },
            author: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            html: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, controller.get.bind(controller));
}
