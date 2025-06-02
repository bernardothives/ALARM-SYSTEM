const sqlite3 = require('sqlite3').verbose();
const fs_actual = require('fs'); 
const path_actual = require('path');


const dbPath = process.env.DATABASE_PATH || path_actual.join(__dirname, '../../data/alarmes_db.sqlite');
const dbDir = path_actual.dirname(dbPath);

if (!fs_actual.existsSync(dbDir)) {
    fs_actual.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database (alarmes).');
        initializeDb();
    }
});

function initializeDb() {
    const schema = fs_actual.readFileSync(path_actual.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error("Error initializing database schema:", err.message);
        } else {
            console.log("User database schema initialized or already exists.");
        }
    });
}

module.exports = db;