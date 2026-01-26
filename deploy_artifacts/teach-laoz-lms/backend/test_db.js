const Database = require('better-sqlite3');
try {
    const db = new Database('lms.db', { verbose: console.log });
    const rows = db.prepare("SELECT * FROM users").all();
    console.log(JSON.stringify(rows, null, 2));
} catch (err) {
    console.error(err);
}
