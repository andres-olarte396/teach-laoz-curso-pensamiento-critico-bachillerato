export interface EvaluationAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface EvaluationResult {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: Date;
  answers: any;
}
