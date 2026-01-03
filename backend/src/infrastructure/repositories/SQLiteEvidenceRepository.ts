import { Database } from 'better-sqlite3';
import { IEvidenceRepository, Evidence } from '../../domain/repositories/IEvidenceRepository.js';

export class SQLiteEvidenceRepository implements IEvidenceRepository {
  constructor(private db: Database) {}

  async add(evidence: Evidence): Promise<void> {
    const stmt = this.db.prepare(
      `INSERT INTO student_evidence (id, user_id, course_id, lesson_id, content, media_url, type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    stmt.run(
      evidence.id,
      evidence.userId,
      evidence.courseId,
      evidence.lessonId,
      evidence.content,
      evidence.mediaUrl,
      evidence.type,
      evidence.createdAt.toISOString()
    );
  }

  async getByLesson(userId: string, courseId: string, lessonId: string): Promise<Evidence[]> {
    const stmt = this.db.prepare(
      `SELECT * FROM student_evidence 
       WHERE user_id = ? AND course_id = ? AND lesson_id = ? 
       ORDER BY created_at DESC`
    );
    
    const rows = stmt.all(userId, courseId, lessonId) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      lessonId: row.lesson_id,
      content: row.content,
      mediaUrl: row.media_url,
      type: row.type,
      createdAt: new Date(row.created_at)
    }));
  }
}
