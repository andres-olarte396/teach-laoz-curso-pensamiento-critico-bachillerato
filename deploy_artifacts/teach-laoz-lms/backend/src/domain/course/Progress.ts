export interface UserProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastAccessedAt: Date;
}
