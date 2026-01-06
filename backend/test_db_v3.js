const fs = require('fs');
console.log('CWD:', process.cwd());
try {
    const list = fs.readdirSync('./uploads');
    console.log('Uploads:', list);
} catch (e) {
    console.log('No uploads dir');
}

try {
    const db = require('better-sqlite3')('lms.db');
    const row = db.prepare("SELECT email, avatar_url FROM users WHERE email LIKE '%andres%'").get();
    console.log('User:', row);
} catch(e) {
    console.error('DB Error:', e.message);
}
