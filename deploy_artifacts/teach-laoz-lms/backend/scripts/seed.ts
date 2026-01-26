import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../src/infrastructure/database/sqlite.js';
import { logger } from '../src/shared/logger/logger.js';

async function seed() {
  logger.info('🌱 Seeding Database...');

  // 1. Create Default Admin User
  const email = 'admin@teachlaoz.com';
  const password = 'admin'; // Change this in production!

  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (existing) {
    logger.info('⚠️  Admin user already exists.');
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, email, passwordHash, 'Admin User', 'admin', now, now);

    logger.info(`✅ Admin user created: ${email} / ${password}`);
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
