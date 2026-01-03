
import { Database } from 'better-sqlite3';
import DatabaseConstructor from 'better-sqlite3';
import path from 'path';

// Assumes running from backend directory
const dbPath = path.resolve(process.cwd(), 'lms.db');
console.log(`Opening DB at: ${dbPath}`);

const db = new DatabaseConstructor(dbPath);

console.log('\n--- USERS ---');
const users = db.prepare('SELECT id, email, name FROM users').all();
console.table(users);

console.log('\n--- EVALUATION RESULTS (JSON) ---');
const results = db.prepare('SELECT id, user_id, lesson_id, score, submitted_at FROM evaluation_results ORDER BY submitted_at DESC LIMIT 5').all();
console.log(JSON.stringify(results, null, 2));

console.log('\n--- USERS (JSON) ---');
console.log(JSON.stringify(users, null, 2));

if (results.length === 0) {
    console.log('No evaluation results found.');
} else {
    console.log(`Found ${results.length} results.`);
}
