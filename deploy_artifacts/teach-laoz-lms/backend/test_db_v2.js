const files = require('fs').readdirSync('.');
console.log('Files in CWD:', files);
try {
    const db = require('better-sqlite3')('lms.db');
    const rows = db.prepare("SELECT id, name, email, avatar_url FROM users").all();
    console.log('Users:', JSON.stringify(rows));
} catch (e) {
    console.error('DB Error:', e);
}
