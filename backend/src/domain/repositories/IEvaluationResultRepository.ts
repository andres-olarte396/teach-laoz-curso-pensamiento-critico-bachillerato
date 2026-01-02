import { EvaluationResult } from '../entities/EvaluationResult.js';

export interface IEvaluationResultRepository {
  save(result: EvaluationResult): Promise<void>;
  update(result: EvaluationResult): Promise<void>;
  findAll(): Promise<EvaluationResult[]>;
  findByUserAndLesson(userId: string, lessonId: string): Promise<EvaluationResult | null>;
}
