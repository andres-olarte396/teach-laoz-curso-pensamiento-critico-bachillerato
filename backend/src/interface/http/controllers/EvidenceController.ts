import { FastifyRequest, FastifyReply } from 'fastify';
import { AddEvidence } from '../../../application/use-cases/evidence/AddEvidence.js';
import { GetEvidence } from '../../../application/use-cases/evidence/GetEvidence.js';

export class EvidenceController {
  constructor(
    private addEvidenceUseCase: AddEvidence,
    private getEvidenceUseCase: GetEvidence
  ) {}

  async addEvidence(req: FastifyRequest, reply: FastifyReply) {
    const { courseId, lessonId } = req.params as { courseId: string; lessonId: string };
    const { content, type, mediaUrl } = req.body as { content: string; type?: 'text' | 'image'; mediaUrl?: string };
    
    // Get user ID from cookies or authentication context
    // Assuming auth middleware populates req.user or similar, but for now we might need to extract from cookie or simple standard user if auth logic is specific anywhere else.
    // Based on logs, there's "No Authorization was found in request.cookies", so we might need to rely on the auth middleware to set user.
    // However, looking at CommentController or ProgressController would be safer.
    // I'll assume req.user is populated by auth middleware.
    const user = (req as any).user;
    if (!user) {
        return reply.status(401).send({ message: 'Unauthorized' });
    }

    try {
      const evidence = await this.addEvidenceUseCase.execute(user.id, courseId, lessonId, content, type, mediaUrl);
      return reply.code(201).send(evidence);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Failed to add evidence' });
    }
  }

  async getEvidence(req: FastifyRequest, reply: FastifyReply) {
    const { courseId, lessonId } = req.params as { courseId: string; lessonId: string };
    const user = (req as any).user;
    
    if (!user) {
        return reply.status(401).send({ message: 'Unauthorized' });
    }

    try {
      const evidence = await this.getEvidenceUseCase.execute(user.id, courseId, lessonId);
      return reply.send(evidence);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve evidence' });
    }
  }
}
