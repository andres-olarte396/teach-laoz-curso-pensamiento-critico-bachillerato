import { IEvaluationResultRepository } from '../../../domain/repositories/IEvaluationResultRepository.js';
import { EvaluationResult } from '../../../domain/entities/EvaluationResult.js';

export class ListEvaluations {
  constructor(private repository: IEvaluationResultRepository) {}

  async execute(): Promise<EvaluationResult[]> {
    return this.repository.findAll();
  }
}
