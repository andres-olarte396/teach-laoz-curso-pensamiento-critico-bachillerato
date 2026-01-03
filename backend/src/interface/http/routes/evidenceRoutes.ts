import { FastifyInstance } from 'fastify';
import { EvidenceController } from '../controllers/EvidenceController.js';
import { SQLiteEvidenceRepository } from '../../../infrastructure/repositories/SQLiteEvidenceRepository.js';
import { AddEvidence } from '../../../application/use-cases/evidence/AddEvidence.js';
import { GetEvidence } from '../../../application/use-cases/evidence/GetEvidence.js';
import { db } from '../../../infrastructure/database/sqlite.js';

export async function evidenceRoutes(fastify: FastifyInstance) {
  const evidenceRepository = new SQLiteEvidenceRepository(db);
  const addEvidenceUseCase = new AddEvidence(evidenceRepository);
  const getEvidenceUseCase = new GetEvidence(evidenceRepository);
  const evidenceController = new EvidenceController(addEvidenceUseCase, getEvidenceUseCase);

  fastify.post('/:courseId/:lessonId', {
    onRequest: [fastify.authenticate]
  }, evidenceController.addEvidence.bind(evidenceController));

  fastify.get('/:courseId/:lessonId', {
    onRequest: [fastify.authenticate]
  }, evidenceController.getEvidence.bind(evidenceController));
}
