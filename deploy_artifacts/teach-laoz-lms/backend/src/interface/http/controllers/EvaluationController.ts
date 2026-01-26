import { FastifyReply, FastifyRequest } from 'fastify';
import { SubmitEvaluation } from '../../../application/use-cases/evaluation/SubmitEvaluation.js';
import { ListEvaluations } from '../../../application/use-cases/evaluation/ListEvaluations.js';
import { z } from 'zod';

const submitBodySchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionId: z.string()
  }))
});

import { GetEvaluation } from '../../../application/use-cases/GetEvaluation.js';

export class EvaluationController {
  constructor(
    private submitEvaluation: SubmitEvaluation,
    private listEvaluations: ListEvaluations,
    private getEvaluation: GetEvaluation
  ) {}

  async submit(req: FastifyRequest, reply: FastifyReply) {
    const { courseId, lessonId } = req.params as any;
    const user = req.user as any;
    
    // Debug Log
    req.log.info({ user, userId: user?.id }, 'SUBMIT EVALUATION - User Context');

    const { answers } = submitBodySchema.parse(req.body);

    try {
        const result = await this.submitEvaluation.execute({
            userId: user.id || 'anonymous', // Fallback should represent error in auth middleware if reached
            courseId,
            lessonId,
            answers
        });
        req.log.info({ resultId: result.id }, 'Evaluation submitted successfully');
        return reply.code(201).send(result);
    } catch (error) {
        req.log.error(error);
        return reply.code(400).send({ message: 'Error submitting evaluation', error });
    }
  }

  // ... list and listMine remain the same ...

  async list(req: FastifyRequest, reply: FastifyReply) {
    const { userId: filterUserId } = req.query as { userId?: string };
    const user = req.user as any;
    
    const effectiveUserId = filterUserId || user.id;

    // TODO: Add proper Role-Based Access Control (RBAC) here later.
    
    const isExplicitFilter = !!filterUserId;
    const requesterId = user.id;
    
    // Admin Check
    const isAdmin = user.role === 'admin' || user.email?.includes('teachlaoz.com'); 

    let queryUserId: string | undefined = undefined;

    if (isAdmin) {
        queryUserId = filterUserId; // Can be undefined (Applies findAll)
    } else {
        queryUserId = user.id; // Force isolation
    }

    req.log.info({ query: req.query, userId: queryUserId, requester: user.id, isAdmin }, 'ADMIN LIST EVALUATIONS');

    try {
        const results = await this.listEvaluations.execute(queryUserId);
        return reply.code(200).send(results);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ message: 'Error fetching evaluations', error });
    }
  }

  async listMine(req: FastifyRequest, reply: FastifyReply) {
      const user = req.user as any;
      
      // Debug Log
      req.log.info({ user, userId: user?.id }, 'LIST MINE - User Context');

      try {
          const results = await this.listEvaluations.execute(user.id);
          req.log.info({ count: results.length }, 'Found results for user');
          return reply.code(200).send(results);
      } catch (error) {
          req.log.error(error);
          return reply.code(500).send({ message: 'Error fetching my evaluations', error });
      }
  }

  async get(req: FastifyRequest, reply: FastifyReply) {
      const { '*' : path } = req.params as any;
      req.log.info({ path }, 'GET EVALUATION DEFINITION');
      try {
          const evaluation = await this.getEvaluation.execute(path);
          return reply.code(200).send(evaluation);
      } catch (err: any) {
          req.log.error(err);
          if (err.message.includes('not found')) {
             return reply.code(404).send({ message: 'Evaluation not found' });
          }
          return reply.code(500).send({ message: 'Error loading evaluation', error: err.message });
      }
  }
}

