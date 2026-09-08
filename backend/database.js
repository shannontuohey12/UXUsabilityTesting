const Database = require("better-sqlite3");

const db = new Database("uxresearch.db");

// Create studies table
db.exec(`
    CREATE TABLE IF NOT EXISTS studies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target_url TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
`);

// Create sessions table
db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        study_id INTEGER NOT NULL,
        session_id TEXT NOT NULL UNIQUE,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        FOREIGN KEY (study_id) REFERENCES studies(id)
    )
`);

// Create events table
db.exec(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        study_id INTEGER NOT NULL,
        session_id TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        data TEXT,
        FOREIGN KEY (study_id) REFERENCES studies(id)
    )
`);

//adding study_id column to events table if it doesn't exist
try {
    db.exec(`
        ALTER TABLE events
        ADD COLUMN study_id INTEGER
    `);
    
    console.log("Added study_id to events table.");
} catch (error) {
    if (!error.message.includes("duplicate column name")) {
        throw error;
    }
}

console.log("Database connected.");


module.exports = db;