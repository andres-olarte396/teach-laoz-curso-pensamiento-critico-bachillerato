import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const db = new Database('./lms.db');

// Enable foreign keys explicitly to test if this is the blocker
db.pragma('foreign_keys = ON');

console.log('Testing insertion with non-existent user...');

try {
    const stmt = db.prepare(`
      INSERT INTO evaluation_results (id, user_id, course_id, lesson_id, score, data, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      randomUUID(),
      'non-existent-user-id-' + Date.now(), // ID that definitely doesn't exist
      'test-course',
      'test-lesson',
      100,
      '[]',
      new Date().toISOString()
    );
    console.log('SUCCESS: Inserted record despite missing user (FKs might be OFF)');
} catch (error) {
    console.error('FAILURE: Could not insert record.');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
}
