import Database from 'better-sqlite3';

const db = new Database('./lms.db');

console.log('--- USERS ---');
const users = db.prepare('SELECT * FROM users').all();
console.log(JSON.stringify(users, null, 2));

console.log('--- EVALUATION RESULTS ---');
const results = db.prepare('SELECT * FROM evaluation_results').all();
console.log(JSON.stringify(results, null, 2));
