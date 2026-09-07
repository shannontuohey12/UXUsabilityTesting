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

// Receive tracking events
app.post("/api/events", (req, res) => {
    const event = req.body;
    console.log("\n===== EVENT RECEIVED =====");
    console.log(event);
    console.log("==========================\n");

    // Prepare database insert
    const insert = db.prepare(`
        INSERT INTO events (
            session_id,
            type,
            url,
            timestamp,
            data
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    // Store event in database 
    insert.run(
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