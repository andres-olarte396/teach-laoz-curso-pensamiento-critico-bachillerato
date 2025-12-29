import { ICommentRepository } from '../../domain/repositories/ICommentRepository.js';
import { Comment } from '../../domain/entities/Comment.js';
import { db } from '../database/sqlite.js';

export class SQLiteCommentRepository implements ICommentRepository {
  async findByPostId(postId: string): Promise<Comment[]> {
    const stmt = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(postId) as any[];
    return rows.map(this.mapRow);
  }

  async save(comment: Comment): Promise<void> {
    const stmt = db.prepare(`
      INSERT INTO comments (id, post_id, author_name, author_email, content, created_at)
      VALUES (@id, @postId, @authorName, @authorEmail, @content, @createdAt)
    `);
    
    stmt.run({
      id: comment.id,
      postId: comment.postId,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail || null,
      content: comment.content,
      createdAt: comment.createdAt.toISOString()
    });
  }

  private mapRow(row: any): Comment {
    return {
      id: row.id,
      postId: row.post_id,
      authorName: row.author_name,
      authorEmail: row.author_email,
      content: row.content,
      createdAt: new Date(row.created_at)
    };
  }
}
