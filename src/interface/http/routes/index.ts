import { FastifyInstance } from 'fastify';
import { ContentController } from '../controllers/ContentController.js';

export async function contentRoutes(app: FastifyInstance) {
  const controller = new ContentController();

  app.get('/menu', controller.getMenu.bind(controller));
  app.get('/content/*', controller.getContentByPath.bind(controller));
}
