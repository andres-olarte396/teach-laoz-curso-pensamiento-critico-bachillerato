import { FastifyReply, FastifyRequest } from 'fastify';
import { SaveProgress } from '../../../application/use-cases/progress/SaveProgress.js';
import { GetProgress } from '../../../application/use-cases/progress/GetProgress.js';
import { z } from 'zod';

const saveProgressSchema = z.object({
  courseId: z.string(),
  lessonId: z.string(),
  completed: z.boolean().optional(),
});

export class ProgressController {
  constructor(
    private saveProgress: SaveProgress,
    private getProgress: GetProgress
  ) {}

  async save(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user as any;
    const body = saveProgressSchema.parse(req.body);

    await this.saveProgress.execute({
      userId: user.id,
      courseId: body.courseId,
      lessonId: body.lessonId,
      completed: body.completed,
    });

    return reply.code(200).send({ message: 'Progress saved' });
  }

  async get(req: FastifyRequest) {
    const user = req.user as any;
    const { courseId } = req.params as { courseId: string };

    const progress = await this.getProgress.execute(user.id, courseId);
    return progress;
  }
}
