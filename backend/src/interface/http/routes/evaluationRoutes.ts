import { FastifyInstance } from 'fastify';
import { EvaluationController } from '../controllers/EvaluationController.js';
import { SubmitEvaluation } from '../../../application/use-cases/evaluation/SubmitEvaluation.js';
import { SQLiteEvaluationResultRepository } from '../../../infrastructure/repositories/SQLiteEvaluationResultRepository.js';
import { SQLiteProgressRepository } from '../../../infrastructure/repositories/SQLiteProgressRepository.js';
import { GetEvaluation } from '../../../application/use-cases/GetEvaluation.js';
import { UnifiedMarkdownRenderer } from '../../../infrastructure/services/UnifiedMarkdownRenderer.js';
import { LocalFileSystemRepository } from '../../../infrastructure/repositories/LocalFileSystemRepository.js';
import { db } from '../../../infrastructure/database/sqlite.js';
import { env } from '../../../infrastructure/config/environment.js';

export async function evaluationRoutes(app: FastifyInstance) {
  // Dependency Injection Wiring (Local for this route module)
  const evaluationResultRepository = new SQLiteEvaluationResultRepository(db);
  const progressRepository = new SQLiteProgressRepository(db);
  
  const markdownRenderer = new UnifiedMarkdownRenderer();
  const localFileSystem = new LocalFileSystemRepository();
  // CourseRepo not needed for GetEvaluation, removed to avoid unused variable warning if not used elsewhere
  
  const getEvaluation = new GetEvaluation(localFileSystem, markdownRenderer);
  const submitEvaluation = new SubmitEvaluation(getEvaluation, evaluationResultRepository, progressRepository);
  
  const controller = new EvaluationController(submitEvaluation);

  app.post('/:courseId/:lessonId/submit', {
    onRequest: [app.authenticate]
  }, controller.submit.bind(controller));
}
