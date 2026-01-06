const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

console.log('--- DIAGNOSTIC START ---');
console.log('CWD:', process.cwd());

// 1. Check Uploads persistence
try {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        console.log(`Uploads folder found. Files count: ${files.length}`);
        if (files.length > 0) console.log('Last file:', files[files.length - 1]);
    } else {
        console.log('ERROR: uploads folder does not exist');
    }
} catch (e) {
    console.error('File Check Error:', e.message);
}

// 2. Check DB Persistence
try {
    const db = new Database('lms.db', { readonly: true });
    // Try to find the user by partial email matching "andres"
    const user = db.prepare("SELECT id, name, email, avatar_url FROM users WHERE email LIKE '%andres%'").get();
    
    if (user) {
        console.log('User Found:', JSON.stringify(user, null, 2));
    } else {
        console.log('User ANDRES not found in DB');
        const all = db.prepare("SELECT email FROM users").all();
        console.log('Available users:', all.map(u => u.email));
    }
} catch (e) {
    console.error('DB Error:', e.message);
}
console.log('--- DIAGNOSTIC END ---');
