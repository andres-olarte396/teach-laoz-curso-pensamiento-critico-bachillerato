import { FastifyInstance } from 'fastify';
import { ProgressController } from '../controllers/ProgressController.js';
import { SaveProgress } from '../../../application/use-cases/progress/SaveProgress.js';
import { GetProgress } from '../../../application/use-cases/progress/GetProgress.js';
import { SQLiteProgressRepository } from '../../../infrastructure/repositories/SQLiteProgressRepository.js';
import { GetAllUserProgress } from '../../../application/use-cases/progress/GetAllUserProgress.js';
import { GetCourseCompletion } from '../../../application/use-cases/progress/GetCourseCompletion.js';
import { LocalFileSystemRepository } from '../../../infrastructure/repositories/LocalFileSystemRepository.js';

export async function progressRoutes(app: FastifyInstance) {
  const repository = new SQLiteProgressRepository();
  const contentRepository = new LocalFileSystemRepository();
  const saveProgress = new SaveProgress(repository);
  const getProgress = new GetProgress(repository);
  const getAllUserProgress = new GetAllUserProgress(repository);
  const getCourseCompletion = new GetCourseCompletion(contentRepository, repository);
  const controller = new ProgressController(saveProgress, getProgress, getAllUserProgress, getCourseCompletion);

  app.post('/progress', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['Content'],
      summary: 'Save user progress',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['courseId', 'lessonId'],
        properties: {
          courseId: { type: 'string' },
          lessonId: { type: 'string' },
          completed: { type: 'boolean' },
        },
      },
    }
  }, controller.save.bind(controller));

  app.get('/progress/all', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['Content'],
      summary: 'Get all user progress',
      security: [{ bearerAuth: [] }],
    }
  }, controller.getAll.bind(controller));

  app.get('/progress/:courseId/completion', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['Content'],
      summary: 'Get course completion percentage',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
        },
      },
    }
  }, controller.getCompletion.bind(controller));

  app.get('/progress/:courseId', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['Content'],
      summary: 'Get course progress',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
        },
      },
    }
  }, controller.get.bind(controller));
}
