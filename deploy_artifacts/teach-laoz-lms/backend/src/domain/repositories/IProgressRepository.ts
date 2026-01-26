import { UserProgress } from '../course/Progress.js';

export interface IProgressRepository {
  save(progress: UserProgress): Promise<void>;
  findByUserAndCourse(userId: string, courseId: string): Promise<UserProgress[]>;
  findLatestProgress(userId: string, courseId: string): Promise<UserProgress | null>;
  findAllByUser(userId: string): Promise<UserProgress[]>;
}
