const db = require('better-sqlite3')('lms.db');
const user = db.prepare("SELECT id, name, email, avatar_url FROM users WHERE email = 'andres.olarte@teachlaoz.edu'").get();
console.log('User Record:', user);

if (user) {
    const allUsers = db.prepare("SELECT id, email, avatar_url FROM users").all();
    console.log('All Users Count:', allUsers.length);
    console.log('Sample User:', allUsers[0]);
} else {
    console.log('Target user not found. Listing all emails:');
    const emails = db.prepare("SELECT email FROM users").all();
    console.log(emails);
}
