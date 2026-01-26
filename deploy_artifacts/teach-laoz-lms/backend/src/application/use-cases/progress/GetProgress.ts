import { IProgressRepository } from '../../../domain/repositories/IProgressRepository.js';
import { UserProgress } from '../../../domain/course/Progress.js';

export class GetProgress {
  constructor(private progressRepository: IProgressRepository) {}

  async execute(userId: string, courseId: string): Promise<{
    latest: UserProgress | null;
    all: UserProgress[];
  }> {
    const [latest, all] = await Promise.all([
      this.progressRepository.findLatestProgress(userId, courseId),
      this.progressRepository.findByUserAndCourse(userId, courseId)
    ]);

    return { latest, all };
  }
}
