import { describe, it, expect, beforeAll } from 'vitest';
import { createServer } from '../../src/interface/http/app.js';
import { FastifyInstance } from 'fastify';

describe('API Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
  });

  it('GET /health should return ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('status', 'ok');
  });

  it('GET /api/menu should return courses', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/menu',
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data).toHaveProperty('courses');
    expect(Array.isArray(data.courses)).toBe(true);
  });

  it('GET /api/content/example-course should return a list of items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/content/example-course',
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data).toHaveProperty('items');
    expect(data.path).toBe('example-course');
  });

  it('GET /api/content/example-course/README.md should return rendered HTML', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/content/example-course/README.md',
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data).toHaveProperty('html');
    expect(data.type).toBe('markdown');
  });

  it('GET /api/content/non-existent should return 404', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/content/non-existent',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toHaveProperty('code', 'CONTENT_NOT_FOUND');
  });
});
