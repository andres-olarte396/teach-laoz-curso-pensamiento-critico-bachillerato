import { Database } from 'better-sqlite3';
import { IEvaluationResultRepository } from '../../domain/repositories/IEvaluationResultRepository.js';
import { EvaluationResult } from '../../domain/entities/EvaluationResult.js';

export class SQLiteEvaluationResultRepository implements IEvaluationResultRepository {
  constructor(private db: Database) {}

  async save(result: EvaluationResult): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO evaluation_results (id, user_id, course_id, lesson_id, score, data, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      result.id,
      result.userId,
      result.courseId,
      result.lessonId,
      result.score,
      JSON.stringify(result.answers),
      result.submittedAt.toISOString()
    );
  }

  async findByUserAndLesson(userId: string, lessonId: string): Promise<EvaluationResult | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM evaluation_results
      WHERE user_id = ? AND lesson_id = ?
      ORDER BY submitted_at DESC
      LIMIT 1
    `);

    const row = stmt.get(userId, lessonId) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      lessonId: row.lesson_id,
      score: row.score,
      totalQuestions: 0, // Not stored explicitly, might need to change schema or infer
      correctAnswers: 0, // Not stored explicitly
      submittedAt: new Date(row.submitted_at),
      answers: JSON.parse(row.data)
    };
  }
}
