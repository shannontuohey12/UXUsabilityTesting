const express = require("express");
const cors = require("cors");
const db = require("./database");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(
    "/screenshots",
    express.static(
        path.join(__dirname, "screenshots")
    )
);

const PORT = 3000;

async function captureWebsiteScreenshot(studyId, targetUrl) {
    try {
        console.log("Capturing screenshot for:", targetUrl);

        const browser = await chromium.launch();

        const page = await browser.newPage({
            viewport: {
                width: 1440,
                height: 900
            }
        });

        await page.goto(targetUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        // Give the page time to finish rendering
        await page.waitForTimeout(5000);

        const screenshotDirectory = path.join(
            __dirname,
            "screenshots"
        );

        if (!fs.existsSync(screenshotDirectory)) {
            fs.mkdirSync(screenshotDirectory);
        }

        const screenshotPath = path.join(
            screenshotDirectory,
            `study-${studyId}.png`
        );

        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        await browser.close();

        console.log(
            "Screenshot saved:",
            screenshotPath
        );

        return screenshotPath;

    } catch (error) {
        console.error(
            "Screenshot error:",
            error.message
        );

        return null;
    }
}

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("UX Research Platform backend is running!");
});

// StudyId 
app.get("/test/:studyId", (req, res) => {
    const studyId = Number(req.params.studyId);

    const study = db.prepare(`
        SELECT *
        FROM studies
        WHERE id = ?
    `).get(studyId);

    if (!study) {
        return res.status(404).send("Study not found.");
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${study.name}</title>

            <style>
                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                }

                .study-header {
                    padding: 20px;
                    background: white;
                    border-bottom: 1px solid #ddd;
                }

                .study-header h1 {
                    margin: 0 0 5px 0;
                }

                .study-header p {
                    margin: 0;
                    color: #666;
                }

                .website-container {
                    width: 100%;
                    height: calc(100vh - 90px);
                }

                iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
            </style>
        </head>

        <body>

            <div class="study-header">
                <h1>${study.name}</h1>
                <p>Complete the tasks on the website below.</p>
            </div>

            <div class="website-container">
                <iframe
                    src="/proxy/${studyId}"
                    title="${study.name}"
                ></iframe>
            </div>

        </body>
        </html>
    `);
});

//PROXY ROUTE

app.get("/proxy/:studyId", async (req, res) => {
    try {
        const studyId = Number(req.params.studyId);

        console.log("PROXY STUDY ID:", studyId);

        const study = db.prepare(`
            SELECT *
            FROM studies
            WHERE id = ?
        `).get(studyId);

        if (!study) {
            return res.status(404).send("Study not found.");
        }

        console.log("Proxying:", study.target_url);

        const response = await fetch(study.target_url);

        if (!response.ok) {
            return res.status(response.status).send(
                `Could not load target website. Status: ${response.status}`
            );
        }

        let html = await response.text();

        const trackerUrl =
            `https://sue-womens-held-signs.trycloudflare.com/tracker.js?uxStudyId=${studyId}`;

        const trackerScript = `
            <script src="${trackerUrl}"></script>
        `;

        if (html.includes("</head>")) {
            html = html.replace(
                "</head>",
                `${trackerScript}</head>`
            );
        } else {
            html = trackerScript + html;
        }

        res.send(html);

    } catch (error) {
        console.error("Proxy error:", error);

        res.status(500).send(
            "Could not load the target website."
        );
    }
});

app.get("/tracker.js", (req, res) => {
    res.sendFile(
        path.join(__dirname, "tracker.js")
    );
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

    const studyId = result.lastInsertRowid;

    captureWebsiteScreenshot(
        studyId,
        targetUrl
    );

    console.log("STUDY CREATED:", result.lastInsertRowid);

    res.status(201).json({
        success: true,
        study: {
            id: studyId,
            name: name,
            targetUrl: targetUrl,
            createdAt: createdAt
        }
    });
});
//studies get route 
app.get("/api/studies", (req, res) => {
    try {
        const studies = db.prepare(`
            SELECT *
            FROM studies
            ORDER BY id ASC
        `).all();

        res.json(studies);

    } catch (error) {
        console.error("Error fetching studies:", error);

        res.status(500).json({
            success: false,
            message: "Could not fetch studies."
        });
    }
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
    const studyId = Number(req.params.id);

    const screenshotUrl =
    `/screenshots/study-${studyId}.png`;

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
    const heatmapData = [];

    //get scrolling depth
    const scrollDepth = db.prepare(`
        SELECT
            json_extract(data, '$.scrollDepth') AS depth,
            COUNT(DISTINCT session_id) AS participants
        FROM events
        WHERE study_id = ?
        AND type = 'SCROLL'
        GROUP BY depth
        ORDER BY CAST(depth AS INTEGER)
    `).all(studyId);

    clickEvents.forEach((event) => {

    try {

        const data = JSON.parse(event.data);

        // HEATMAP DATA

        if (
            data.x !== undefined &&
            data.y !== undefined
        ) {
            heatmapData.push({
                x: data.x,
                y: data.y
            });
        }

        // MOST CLICKED ELEMENTS

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
        mostClickedElements: mostClickedElements,
        scrollDepth: scrollDepth,
        heatmapData: heatmapData,
        screenshotUrl: screenshotUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});