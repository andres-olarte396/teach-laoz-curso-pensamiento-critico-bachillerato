export interface Evidence {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  content: string;
  mediaUrl?: string;
  type: 'text' | 'image';
  createdAt: Date;
}

export interface IEvidenceRepository {
  add(evidence: Evidence): Promise<void>;
  getByLesson(userId: string, courseId: string, lessonId: string): Promise<Evidence[]>;
}
