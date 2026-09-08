const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("UX Research Platform backend is running!");
});

//Create a study 
app.post("/api/studies", (req, res) => {

    console.log("REQUEST BODY:", req.body);

    const name = req.body.name;
    const targetUrl = req.body.targetUrl;

    console.log("NAME:", name);
    console.log("TARGET URL:", targetUrl);

    if (!name || !targetUrl) {
        return res.status(400).json({
            success: false,
            message: "Study name and target URL are required."
        });
    }

    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
        INSERT INTO studies (
            name,
            target_url,
            created_at
        )
        VALUES (?, ?, ?)
    `);

    const result = insert.run(
        name,
        targetUrl,
        createdAt
    );

    console.log("STUDY CREATED:", result.lastInsertRowid);

    res.status(201).json({
        success: true,
        study: {
            id: result.lastInsertRowid,
            name: name,
            targetUrl: targetUrl,
            createdAt: createdAt
        }
    });
});

// Sessions 
app.post("/api/sessions", (req, res) => {
    const { studyId, sessionId } = req.body;

    console.log("\n===== SESSION START =====");
    console.log("Study ID:", studyId);
    console.log("Session ID:", sessionId);
    console.log("=========================\n");

    if (!studyId || !sessionId) {
        return res.status(400).json({
            success: false,
            message: "Study ID and session ID are required."
        });
    }

    const startedAt = new Date().toISOString();

    const insert = db.prepare(`
        INSERT INTO sessions (
            study_id,
            session_id,
            started_at
        )
        VALUES (?, ?, ?)
    `);

    insert.run(
        studyId,
        sessionId,
        startedAt
    );

    res.status(201).json({
        success: true,
        session: {
            studyId,
            sessionId,
            startedAt
        }
    });
});

// Receive tracking events
app.post("/api/events", (req, res) => {
    const event = req.body;
    console.log("\n===== EVENT RECEIVED =====");
    console.log(event);
    console.log("==========================\n");

    // Prepare database insert
    const insert = db.prepare(`
        INSERT INTO events (
            study_id,
            session_id,
            type,
            url,
            timestamp,
            data
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Store event in database 
    insert.run(
        event.studyId,
        event.sessionId,
        event.type,
        event.url,
        event.timestamp,
        JSON.stringify(event)
    );

    res.status(200).json({
        success: true,
        message: "Event received and stored."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});