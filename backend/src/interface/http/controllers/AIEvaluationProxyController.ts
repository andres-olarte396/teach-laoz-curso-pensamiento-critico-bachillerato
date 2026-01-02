import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { IEvaluationResultRepository } from '../../../domain/repositories/IEvaluationResultRepository.js';
import { EvaluationResult } from '../../../domain/entities/EvaluationResult.js';

const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3001';

// Input Schema matches the AI Service input
const proxyBodySchema = z.object({
  submissionId: z.string(),
  question: z.string(),
  answer: z.string(),
  context: z.array(z.string()).default([])
});

export class AIEvaluationProxyController {
  
  constructor(private readonly repository: IEvaluationResultRepository) {}

  public evaluateProxy = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = proxyBodySchema.parse(req.body);
      const user = (req as any).user;
      const userId = user?.id || 'anonymous';
      
      // Parse IDs
      const idParts = body.submissionId.split('/');
      const courseId = idParts[0] || 'unknown_course';
      const lessonId = body.submissionId.replace(/-[0-9]+$/, '');

      // 1. Create Pending Result
      const pendingResult: EvaluationResult = {
        id: body.submissionId,
        userId: userId,
        courseId: courseId,
        lessonId: lessonId,
        score: -1, 
        totalQuestions: 1,
        correctAnswers: 0,
        submittedAt: new Date(),
        answers: {
          status: 'PENDING',
          question: body.question,
          answer: body.answer
        }
      };

      // 2. Save Pending State
      await this.repository.save(pendingResult);

      // 3. Trigger Background Process (Fire & Forget)
      this.processBackgroundEvaluation(body, pendingResult);

      // 4. Return Immediate Response
      return reply.code(202).send({ 
        success: true, 
        status: 'pending', 
        message: 'Evaluation queued. Check back later.',
        submissionId: body.submissionId
      });

    } catch (error) {
      console.error('[LMS Proxy] Error:', error);
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ success: false, error: 'Validation Error', details: error.errors });
      }
      return reply.code(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  };

  private async processBackgroundEvaluation(body: any, pendingResult: EvaluationResult) {
    console.log(`[Async Worker] Starting evaluation for ${body.submissionId}`);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 600000); // 10 mins

        const response = await fetch(`${aiServiceUrl}/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        
        clearTimeout(timeout);

        if (!response.ok) {
           throw new Error(`AI Service failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Update Result
        pendingResult.score = data.data.score;
        pendingResult.answers = {
            status: 'COMPLETED',
            result: data.data.result, 
            raw_data: data
        };
        
        await this.repository.update(pendingResult);
        console.log(`[Async Worker] Completed evaluation for ${body.submissionId}`);

    } catch (err: unknown) {
        console.error(`[Async Worker] Failed evaluation for ${body.submissionId}`, err);
        pendingResult.score = 0;
        pendingResult.answers = {
            status: 'FAILED',
            error: (err as Error).message || 'Unknown error'
        };
        await this.repository.update(pendingResult).catch((e: unknown) => console.error("Failed to save error state", e));
    }
  }
}
