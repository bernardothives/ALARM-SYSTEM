const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const dbPath = path.resolve(__dirname, '../..', config.databasePath);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log(`Connected to the SQLite database at ${dbPath} (logging-service).`);
        initializeDb();
    }
});

function initializeDb() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error("Error initializing logging database schema:", err.message);
            } else {
                console.log("Logging database schema initialized or already exists.");
            }
        });
    } catch (readErr) {
        console.error("Could not read logging schema.sql:", readErr.message);
        process.exit(1);
    }
}

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error('DB Run Error:', err.message, 'SQL:', sql, 'Params:', params);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.error('DB Get Error:', err.message, 'SQL:', sql, 'Params:', params);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('DB All Error:', err.message, 'SQL:', sql, 'Params:', params);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = { run, get, all, dbInstance: db };