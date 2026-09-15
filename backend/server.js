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


// STUDY ANALYTICS

app.get("/api/studies/:id/analytics", (req, res) => {
    const studyId = req.params.id;

    // Get study information
    const study = db.prepare(`
        SELECT *
        FROM studies
        WHERE id = ?
    `).get(studyId);

    if (!study) {
        return res.status(404).json({
            success: false,
            message: "Study not found."
        });
    }

    // Count participants/sessions
    const participants = db.prepare(`
        SELECT COUNT(DISTINCT session_id) AS count
        FROM sessions
        WHERE study_id = ?
    `).get(studyId);

    // Count all events
    const totalEvents = db.prepare(`
        SELECT COUNT(*) AS count
        FROM events
        WHERE study_id = ?
    `).get(studyId);

    // Count clicks
    const clicks = db.prepare(`
        SELECT COUNT(*) AS count
        FROM events
        WHERE study_id = ?
        AND type = 'CLICK'
    `).get(studyId);

    // Count page views
    const pageViews = db.prepare(`
        SELECT COUNT(*) AS count
        FROM events
        WHERE study_id = ?
        AND type = 'PAGE_VIEW'
    `).get(studyId);

    // Count scroll events
    const scrolls = db.prepare(`
        SELECT COUNT(*) AS count
        FROM events
        WHERE study_id = ?
        AND type = 'SCROLL'
    `).get(studyId);

    // Get event activity by minute
    const eventActivity = db.prepare(`
        SELECT
            strftime('%Y-%m-%d %H:%M', timestamp) AS minute,
            COUNT(*) AS count
        FROM events
        WHERE study_id = ?
        GROUP BY minute
        ORDER BY minute ASC
    `).all(studyId);

    // Get most clicked elements
    const clickEvents = db.prepare(`
        SELECT data
        FROM events
        WHERE study_id = ?
        AND type = 'CLICK'
    `).all(studyId);

    const clickCounts = {};

    clickEvents.forEach((event) => {
        try {
            const data = JSON.parse(event.data);

            let elementName = data.text?.trim();

            if (!elementName) {
                elementName = data.id;
            }

            if (!elementName) {
                elementName = data.element;
            }

            if (!elementName) {
                elementName = "Unknown element";
            }

            clickCounts[elementName] =
                (clickCounts[elementName] || 0) + 1;

        } catch (error) {
            console.error("Error parsing click event:", error);
        }
    });

    const mostClickedElements = Object.entries(clickCounts)
        .map(([element, clicks]) => ({
            element,
            clicks
        }))
        .sort((a, b) => b.clicks - a.clicks);

    res.json({
        success: true,

        study: {
            id: study.id,
            name: study.name,
            targetUrl: study.target_url
        },

        participants: participants.count,
        totalEvents: totalEvents.count,
        clicks: clicks.count,
        pageViews: pageViews.count,
        scrolls: scrolls.count,
        eventActivity: eventActivity,
        mostClickedElements: mostClickedElements
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});