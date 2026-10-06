const express = require("express");
const router = express.Router();

const db = require("../database");

// Create a participant session
router.post("/sessions", (req, res) => {
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

    const existingSession = db.prepare(`
        SELECT *
        FROM sessions
        WHERE session_id = ?
        `).get(sessionId);

        if (existingSession) {
        return res.status(200).json({
            success: true,
            message: "Session already exists.",
            session: existingSession
        });
        }

        insert.run(studyId, sessionId, startedAt);

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
router.post("/events", (req, res) => {
    const event = req.body;

    console.log("\n===== EVENT RECEIVED =====");
    console.log(event);
    console.log("==========================\n");

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

module.exports = router;