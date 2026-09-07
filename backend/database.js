const Database = require("better-sqlite3");

const db = new Database("uxresearch.db");

// Create events table
db.exec(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        data TEXT
    )
`);

console.log("Database connected.");

module.exports = db;