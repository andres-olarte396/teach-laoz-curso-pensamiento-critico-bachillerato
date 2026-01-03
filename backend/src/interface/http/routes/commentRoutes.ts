import { FastifyInstance } from 'fastify';
import { CommentController } from '../controllers/CommentController.js';

export async function commentRoutes(app: FastifyInstance) {
  const controller = new CommentController();

  app.get<{ Params: { resourceId: string } }>('/:resourceId', controller.list.bind(controller));
  
  app.post<{ Params: { resourceId: string }; Body: { authorName?: string; content: string } }>('/:resourceId', {
    onRequest: [app.authenticate]
  }, controller.create.bind(controller));
}
