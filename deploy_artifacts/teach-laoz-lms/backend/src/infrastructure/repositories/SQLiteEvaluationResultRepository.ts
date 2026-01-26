import { Database } from 'better-sqlite3';
import { IEvaluationResultRepository } from '../../domain/repositories/IEvaluationResultRepository.js';
import { EvaluationResult } from '../../domain/entities/EvaluationResult.js';

export class SQLiteEvaluationResultRepository implements IEvaluationResultRepository {
  constructor(private db: Database) {}

  async save(result: EvaluationResult): Promise<void> {
    console.log('[SQLiteRepo] Saving result:', result.id);
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

    return this.mapRowToEntity(row);
  }
  async update(result: EvaluationResult): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE evaluation_results 
      SET score = ?, data = ?, submitted_at = ?
      WHERE id = ?
    `);

    stmt.run(
      result.score,
      JSON.stringify(result.answers),
      result.submittedAt.toISOString(),
      result.id
    );
  }

  async findByUser(userId: string): Promise<EvaluationResult[]> {
    console.log('[SQLiteRepo] findByUser - Filtering for user:', userId);
    const stmt = this.db.prepare(`
      SELECT * FROM evaluation_results
      WHERE user_id = ?
      ORDER BY submitted_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(this.mapRowToEntity);
  }

  async findAll(): Promise<EvaluationResult[]> {
    console.log('[SQLiteRepo] findAll - Querying all results...');
    const stmt = this.db.prepare(`
      SELECT * FROM evaluation_results
      ORDER BY submitted_at DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToEntity);
  }

  private mapRowToEntity(row: any): EvaluationResult {
      const answers = JSON.parse(row.data);
      // Calculate derived stats
      const totalQuestions = Array.isArray(answers) ? answers.length : 0;
      const correctAnswers = Array.isArray(answers) ? answers.filter((a: any) => a.isCorrect).length : 0;

      return {
        id: row.id,
        userId: row.user_id,
        courseId: row.course_id,
        lessonId: row.lesson_id,
        score: row.score,
        totalQuestions,
        correctAnswers,
        submittedAt: new Date(row.submitted_at),
        answers
      };
  }
}
