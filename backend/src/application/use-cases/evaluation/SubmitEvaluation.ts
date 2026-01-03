import { IEvaluationResultRepository } from '../../../domain/repositories/IEvaluationResultRepository.js';
import { IProgressRepository } from '../../../domain/repositories/IProgressRepository.js';
import { GetEvaluation } from '../GetEvaluation.js';
import { EvaluationResult } from '../../../domain/entities/EvaluationResult.js';
import { randomUUID } from 'crypto';

interface SubmitEvaluationDTO {
  userId: string;
  courseId: string;
  lessonId: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
  }[];
}

export class SubmitEvaluation {
  constructor(
    private getEvaluation: GetEvaluation,
    private resultRepo: IEvaluationResultRepository,
    private progressRepo: IProgressRepository
  ) {}

  async execute(dto: SubmitEvaluationDTO): Promise<EvaluationResult> {
    // 1. Get the evaluation definition to check answers
    const evaluation = await this.getEvaluation.execute(dto.lessonId);

    // 2. Calculate Score
    let correctCount = 0;
    const evaluatedAnswers = dto.answers.map(ans => {
      const question = evaluation.questions.find(q => q.id === ans.questionId);
      const isCorrect = question?.correctAnswerId?.toLowerCase() === ans.selectedOptionId.toLowerCase();
      
      if (isCorrect) correctCount++;

      return {
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId,
        isCorrect: !!isCorrect
      };
    });

    const totalQuestions = evaluation.questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // 3. Create Result Entity
    const result: EvaluationResult = {
      id: randomUUID(),
      userId: dto.userId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      score: score,
      totalQuestions: totalQuestions,
      correctAnswers: correctCount,
      submittedAt: new Date(),
      answers: evaluatedAnswers
    };

    // 4. Save Result
    await this.resultRepo.save(result);

    // 5. Mark Progress as Completed if passed (e.g. score >= 70) 
    // OR just mark completed regardless of score? 
    // For now, let's mark completed if they submitted it.
    await this.progressRepo.save({
      userId: dto.userId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      completed: true,
      lastAccessedAt: new Date()
    });

    return result;
  }
}
