import Database from 'better-sqlite3';
import path from 'path';
import { env } from '../config/environment.js';
import { logger } from '../../shared/logger/logger.js';

const dbPath = path.resolve('lms.db');

logger.info(`💾 Opening SQLite database at ${dbPath}`);

export const db = new Database(dbPath, { 
  verbose: env.NODE_ENV === 'development' ? console.log : undefined 
});

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

logger.info('✅ Database schema initialized');
