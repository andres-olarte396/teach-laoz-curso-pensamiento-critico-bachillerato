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
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (@id, @email, @passwordHash, @name, @role, @createdAt, @updatedAt)
    `);
    stmt.run({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
    });
    return user;
  }

  async update(user: User): Promise<User> {
    const stmt = db.prepare(`
        UPDATE users SET name = @name, role = @role, updated_at = @updatedAt
        WHERE id = @id
    `);
    stmt.run({
        id: user.id,
        name: user.name,
        role: user.role,
        updatedAt: new Date().toISOString()
    });
    return user;
  }

  private mapRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      role: row.role as 'student' | 'admin',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
