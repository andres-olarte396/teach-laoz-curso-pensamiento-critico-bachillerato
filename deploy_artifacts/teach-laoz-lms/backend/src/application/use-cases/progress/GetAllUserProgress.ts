import { IProgressRepository } from '../../../domain/repositories/IProgressRepository.js';
import { UserProgress } from '../../../domain/course/Progress.js';

export class GetAllUserProgress {
  constructor(private progressRepository: IProgressRepository) {}

  async execute(userId: string): Promise<UserProgress[]> {
    return this.progressRepository.findAllByUser(userId);
  }
}
