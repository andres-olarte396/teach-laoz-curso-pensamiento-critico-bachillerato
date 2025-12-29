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
  fastify.get('/blog/posts/*', {
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

  // List Comments
  fastify.get('/blog/comments/*', {
    schema: {
      tags: ['Blog'],
      summary: 'List comments for a blog post',
      params: {
        type: 'object',
        properties: {
          '*': { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              postId: { type: 'string' },
              authorName: { type: 'string' },
              content: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const slug = (request.params as any)['*'];
    if (!slug) return reply.code(400).send({ message: 'Slug required' });
    const comments = await controller.getComments.execute(slug);
    return reply.send(comments);
  });

  // Create Comment
  fastify.post('/blog/comments/*', {
    schema: {
      tags: ['Blog'],
      summary: 'Add a comment to a blog post',
      params: {
        type: 'object',
        properties: {
          '*': { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['authorName', 'content'],
        properties: {
          authorName: { type: 'string', minLength: 2 },
          authorEmail: { type: 'string', format: 'email' },
          content: { type: 'string', minLength: 1 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            postId: { type: 'string' },
            authorName: { type: 'string' },
            content: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const slug = (request.params as any)['*'];
    console.log(`[Comments] POST request for slug: ${slug}`);
    const { authorName, authorEmail, content } = request.body as any;
    
    if (!authorName || !content) {
      return reply.code(400).send({ message: 'Author name and content are required' });
    }

    const comment = await controller.addComment.execute({
      postId: slug,
      authorName,
      authorEmail,
      content
    });

    return reply.code(201).send(comment);
  });
}
