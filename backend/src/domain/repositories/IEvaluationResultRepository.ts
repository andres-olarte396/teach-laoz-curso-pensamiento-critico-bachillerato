import { EvaluationResult } from '../entities/EvaluationResult.js';

export interface IEvaluationResultRepository {
  save(result: EvaluationResult): Promise<void>;
  findByUserAndLesson(userId: string, lessonId: string): Promise<EvaluationResult | null>;
}
