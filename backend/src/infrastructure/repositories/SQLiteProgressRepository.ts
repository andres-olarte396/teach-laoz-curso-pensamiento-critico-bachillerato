import { IProgressRepository } from '../../domain/repositories/IProgressRepository.js';
import { UserProgress } from '../../domain/course/Progress.js';
import { db } from '../database/sqlite.js';

export class SQLiteProgressRepository implements IProgressRepository {
  async save(progress: UserProgress): Promise<void> {
    const stmt = db.prepare(`
      INSERT INTO user_progress (user_id, course_id, lesson_id, completed, last_accessed_at)
      VALUES (@userId, @courseId, @lessonId, @completed, @lastAccessedAt)
      ON CONFLICT(user_id, course_id, lesson_id) DO UPDATE SET
        completed = excluded.completed,
        last_accessed_at = excluded.last_accessed_at
    `);

    stmt.run({
      userId: progress.userId,
      courseId: progress.courseId,
      lessonId: progress.lessonId,
      completed: progress.completed ? 1 : 0,
      lastAccessedAt: progress.lastAccessedAt.toISOString(),
    });
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<UserProgress[]> {
    const stmt = db.prepare(`
      SELECT * FROM user_progress 
      WHERE user_id = ? AND course_id = ?
    `);
    const rows = stmt.all(userId, courseId) as any[];
    return rows.map(this.mapRow);
  }

  async findLatestProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    const stmt = db.prepare(`
      SELECT * FROM user_progress 
      WHERE user_id = ? AND course_id = ?
      ORDER BY last_accessed_at DESC
      LIMIT 1
    `);
    const row = stmt.get(userId, courseId) as any;
    if (!row) return null;
    return this.mapRow(row);
  }

  async findAllByUser(userId: string): Promise<UserProgress[]> {
    const stmt = db.prepare(`SELECT * FROM user_progress WHERE user_id = ?`);
    const rows = stmt.all(userId) as any[];
    return rows.map(this.mapRow);
  }

  private mapRow(row: any): UserProgress {
    return {
      userId: row.user_id,
      courseId: row.course_id,
      lessonId: row.lesson_id,
      completed: row.completed === 1,
      lastAccessedAt: new Date(row.last_accessed_at),
    };
  }
}
