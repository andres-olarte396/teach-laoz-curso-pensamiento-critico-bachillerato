import { FastifyInstance } from 'fastify';
import { EvaluationController } from '../controllers/EvaluationController.js';
import { AIEvaluationProxyController } from '../controllers/AIEvaluationProxyController.js';
import { SubmitEvaluation } from '../../../application/use-cases/evaluation/SubmitEvaluation.js';
import { SQLiteEvaluationResultRepository } from '../../../infrastructure/repositories/SQLiteEvaluationResultRepository.js';
import { SQLiteProgressRepository } from '../../../infrastructure/repositories/SQLiteProgressRepository.js';
import { GetEvaluation } from '../../../application/use-cases/GetEvaluation.js';
import { UnifiedMarkdownRenderer } from '../../../infrastructure/services/UnifiedMarkdownRenderer.js';
import { LocalFileSystemRepository } from '../../../infrastructure/repositories/LocalFileSystemRepository.js';
import { db } from '../../../infrastructure/database/sqlite.js';
import { env } from '../../../infrastructure/config/environment.js';
import { ListEvaluations } from '../../../application/use-cases/evaluation/ListEvaluations.js';

export async function evaluationRoutes(app: FastifyInstance) {
  // Dependency Injection Wiring (Local for this route module)
  const evaluationResultRepository = new SQLiteEvaluationResultRepository(db);
  const progressRepository = new SQLiteProgressRepository(db);
  
  const markdownRenderer = new UnifiedMarkdownRenderer();
  const localFileSystem = new LocalFileSystemRepository();
  // CourseRepo not needed for GetEvaluation, removed to avoid unused variable warning if not used elsewhere
  
  const getEvaluation = new GetEvaluation(localFileSystem, markdownRenderer);
  const submitEvaluation = new SubmitEvaluation(getEvaluation, evaluationResultRepository, progressRepository);
  const listEvaluations = new ListEvaluations(evaluationResultRepository);
  
  const controller = new EvaluationController(submitEvaluation, listEvaluations);

  app.post('/:courseId/:lessonId/submit', {
    onRequest: [app.authenticate]
  }, controller.submit.bind(controller));

  // Admin Route for Monitoring
  app.get('/admin/evaluations', {
    onRequest: [app.authenticate]
  }, controller.list.bind(controller));

  const proxyController = new AIEvaluationProxyController(evaluationResultRepository);
  app.post('/ai-proxy', {
    onRequest: [app.authenticate]
  }, proxyController.evaluateProxy.bind(proxyController));
}
