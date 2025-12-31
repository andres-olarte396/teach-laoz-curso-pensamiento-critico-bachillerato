import { IProgressRepository } from '../../../domain/repositories/IProgressRepository.js';
import { UserProgress } from '../../../domain/course/Progress.js';

export interface SaveProgressDTO {
  userId: string;
  courseId: string;
  lessonId: string;
  completed?: boolean;
}

export class SaveProgress {
  constructor(private progressRepository: IProgressRepository) {}

  async execute(dto: SaveProgressDTO): Promise<void> {
    const progress: UserProgress = {
      userId: dto.userId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      completed: dto.completed ?? false,
      lastAccessedAt: new Date(),
    };

    await this.progressRepository.save(progress);
  }
}
