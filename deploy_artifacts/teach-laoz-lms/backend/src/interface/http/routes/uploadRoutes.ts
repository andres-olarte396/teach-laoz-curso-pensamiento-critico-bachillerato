import { FastifyInstance } from 'fastify';
import { UploadController } from '../controllers/UploadController.js';

export async function uploadRoutes(fastify: FastifyInstance) {
  const uploadController = new UploadController();

  fastify.post('/upload', {
    onRequest: [fastify.authenticate]
  }, uploadController.upload.bind(uploadController));
}
