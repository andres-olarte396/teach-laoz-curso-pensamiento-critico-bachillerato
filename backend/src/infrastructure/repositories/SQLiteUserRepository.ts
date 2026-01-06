import { UserRepository, User } from '../../domain/user/User.js';
import { db } from '../database/sqlite.js';

export class SQLiteUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRow(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as any;
    if (!row) return null;
    return this.mapRow(row);
  }

  async create(user: User): Promise<User> {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at, updated_at)
      VALUES (@id, @email, @passwordHash, @name, @role, @avatarUrl, @createdAt, @updatedAt)
    `);
    stmt.run({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
    });
    return user;
  }

  async update(user: User): Promise<User> {
    const stmt = db.prepare(`
        UPDATE users SET name = @name, email = @email, role = @role, avatar_url = @avatarUrl, updated_at = @updatedAt
        WHERE id = @id
    `);
    try {
      stmt.run({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || null,
        updatedAt: new Date().toISOString()
      });
      return user;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
         throw new Error('Email already taken');
      }
      throw error;
    }
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
      const stmt = db.prepare(`
          UPDATE users SET password_hash = @passwordHash, updated_at = @updatedAt
          WHERE id = @id
      `);
      stmt.run({
          id: userId,
          passwordHash,
          updatedAt: new Date().toISOString()
      });
  }

  private mapRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      role: row.role as 'student' | 'admin',
      avatarUrl: row.avatar_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
