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

export class EvaluationController {
  constructor(
    private submitEvaluation: SubmitEvaluation,
    private listEvaluations: ListEvaluations
  ) {}

  async submit(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user as any;
    const { courseId, lessonId } = req.params as { courseId: string; lessonId: string };
    
    // Parse body
    const body = submitBodySchema.parse(req.body);

    try {
      const result = await this.submitEvaluation.execute({
        userId: user.id,
        courseId,
        lessonId,
        answers: body.answers
      });

      return reply.code(200).send(result);
    } catch (error) {
      req.log.error(error);
      return reply.code(500).send({ message: 'Error submitting evaluation', error });
    }
  }

  async list(req: FastifyRequest, reply: FastifyReply) {
    try {
        const results = await this.listEvaluations.execute();
        return reply.code(200).send(results);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ message: 'Error fetching evaluations', error });
    }
  }
}

