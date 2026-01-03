import { IEvaluationResultRepository } from '../../../domain/repositories/IEvaluationResultRepository.js';
import { EvaluationResult } from '../../../domain/entities/EvaluationResult.js';

export class ListEvaluations {
  constructor(private repository: IEvaluationResultRepository) {}

  async execute(userId?: string): Promise<EvaluationResult[]> {
    if (userId) {
        return this.repository.findByUser(userId);
    }
    return this.repository.findAll();
  }
}
