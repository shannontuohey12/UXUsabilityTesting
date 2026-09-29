const express = require("express");
const cors = require("cors");
const db = require("./database");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const app = express();
const crypto = require("crypto");

app.use(
    "/screenshots",
    express.static(
        path.join(__dirname, "screenshots")
    )
);

const PORT = 3000;

async function captureWebsiteScreenshot(studyId, targetUrl) {
    let browser;

    try {
        console.log("Capturing screenshot for:", targetUrl);

        browser = await chromium.launch();

        const page = await browser.newPage({
            viewport: {
                width: 1440,
                height: 900
            }
        });
        try {
            await page.goto(targetUrl, {
            waitUntil: "commit",
            timeout: 60000
        });
        } catch (error) {
            console.log("Navigation timed out, attempting screenshot anyway.");
        }
        

        console.log("Page loaded.");

        // Give the website time to render
        await page.waitForTimeout(5000);

        await page.evaluate(() => {
            document.querySelectorAll("img").forEach(img => {
                img.loading = "eager";
            });
        });

        // Scroll through the page slowly to trigger
        // lazy-loaded content and scroll animations.
        await page.evaluate(async () => {
            const delay = 500;
            const step = 400;

            let previousHeight = 0;
            let unchangedCount = 0;

            while (unchangedCount < 5) {
                const height = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                );

                // Move down the page
                window.scrollBy(0, step);

                await new Promise(resolve =>
                    setTimeout(resolve, delay)
                );

                const newHeight = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                );

                // If the page grew, keep going
                if (newHeight > previousHeight) {
                    unchangedCount = 0;
                } else {
                    unchangedCount++;
                }

                previousHeight = newHeight;

                // If we're at the bottom AND the height has stopped changing,
                // we've probably loaded everything.
                if (
                    window.scrollY + window.innerHeight >= newHeight &&
                    unchangedCount >= 5
                ) {
                    break;
                }
            }

            // Stay at the bottom briefly
            await new Promise(resolve =>
                setTimeout(resolve, 2000)
            );
        });
        console.log("Finished scrolling.");

        // Give animations/lazy content time to finish
        await page.waitForTimeout(2000);

        // Return to top
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });

        await page.waitForTimeout(1000);

        const pageHeight = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
        });

        console.log("PAGE HEIGHT:", pageHeight);

        const screenshotDirectory = path.join(
            __dirname,
            "screenshots"
        );

        if (!fs.existsSync(screenshotDirectory)) {
            fs.mkdirSync(screenshotDirectory, {
                recursive: true
            });
        }

        const screenshotPath = path.join(
            screenshotDirectory,
            `study-${studyId}.png`
        );

        console.log("Taking screenshot...");

        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        console.log(
            "Screenshot saved:",
            screenshotPath
        );

        return screenshotPath;

    } catch (error) {
        console.error(
            "Screenshot error:",
            error
        );

        return null;

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
    res.send("UX Research Platform backend is running!");
});

// unique participant link route
app.get("/participant/:token", (req, res) => {

    try {

        const token = req.params.token;

        // Find the participant link
        const participantLink = db.prepare(`
            SELECT *
            FROM participant_links
            WHERE token = ?
        `).get(token);

        if (!participantLink) {
            return res.status(404).send(`
                <h1>Participant link not found</h1>
                <p>This participant link is invalid.</p>
            `);
        }

        // Find the study connected to this link
        const study = db.prepare(`
            SELECT *
            FROM studies
            WHERE id = ?
        `).get(participantLink.study_id);

        if (!study) {
            return res.status(404).send(`
                <h1>Study not found</h1>
                <p>The study connected to this participant link could not be found.</p>
            `);
        }

        console.log(
            "PARTICIPANT LINK USED:",
            token
        );

        console.log(
            "STUDY:",
            study.id
        );

        // Send participant to the study proxy
        res.redirect(
            `/proxy/${study.id}`
        );

    } catch (error) {

        console.error(
            "Participant route error:",
            error
        );

        res.status(500).send(
            "Could not load participant study."
        );

    }

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

// PROXY ROUTE

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

        // Get the URL we should load
        const requestedUrl =
            req.query.url || study.target_url;

        console.log("Proxying:", requestedUrl);

        const response = await fetch(requestedUrl);

        if (!response.ok) {
            return res.status(response.status).send(
                `Could not load target website. Status: ${response.status}`
            );
        }

        let html = await response.text();

        // ------------------------------------------------
        // REWRITE LINKS
        // ------------------------------------------------

        const targetOrigin =
            new URL(study.target_url).origin;

        const proxyBase =
            `/proxy/${studyId}`;

        html = html.replace(
            /href=["']([^"']+)["']/gi,
            (match, href) => {

                // Ignore special links
                if (
                    href.startsWith("#") ||
                    href.startsWith("mailto:") ||
                    href.startsWith("tel:") ||
                    href.startsWith("javascript:")
                ) {
                    return match;
                }

                try {

                    const absoluteUrl =
                        new URL(
                            href,
                            requestedUrl
                        );

                    // Only proxy links belonging
                    // to the target website
                    if (
                        absoluteUrl.origin === targetOrigin
                    ) {

                        return `href="${proxyBase}?url=${encodeURIComponent(
                            absoluteUrl.href
                        )}"`;

                    }

                } catch (error) {
                    // Leave invalid URLs alone
                }

                return match;
            }
        );

        // ------------------------------------------------
        // INJECT TRACKER
        // ------------------------------------------------

        const trackerUrl =
            `https://teachers-cincinnati-tcp-academy.trycloudflare.com/tracker.js?uxStudyId=${studyId}`;

        const trackerScript = `
            <script src="${trackerUrl}"></script>
        `;

        const participantOverlay = `
            <div id="ux-task-overlay">
                <div id="ux-task-header">
                    <span> Usability Test</span>
                    <button id="ux-task-minimize">−</button>
                </div>

                <div id="ux-task-content">

                    <p id="ux-task-progress">
                        Task 1 of 2
                    </p>

                    <h3 id="ux-task-title">
                        Find the About page
                    </h3>

                    <p id="ux-task-text">
                        Explore the website and find the About page.
                    </p>

                    <div id="ux-task-buttons">
                        <button id="ux-task-complete">
                            ✓ Completed
                        </button>

                        <button id="ux-task-skip">
                            Skip Task
                        </button>
                    </div>

                </div>
            </div>

            <style>
                #ux-task-overlay {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 320px;
                    background: white;
                    border-radius: 14px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
                    z-index: 2147483647;
                    font-family: Arial, sans-serif;
                    overflow: hidden;
                }

                #ux-task-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 16px;
                    background: #f163d7;
                    color: white;
                    font-weight: bold;
                }

                #ux-task-minimize {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 22px;
                    cursor: pointer;
                }

                #ux-task-content {
                    padding: 18px;
                }

                #ux-task-progress {
                    margin: 0 0 8px;
                    font-size: 13px;
                    color: #777;
                }

                #ux-task-title {
                    margin: 0 0 8px;
                    font-size: 18px;
                    color: #222;
                }

                #ux-task-text {
                    margin: 0 0 18px;
                    line-height: 1.5;
                    color: #444;
                }

                #ux-task-buttons {
                    display: flex;
                    gap: 10px;
                }

                #ux-task-complete,
                #ux-task-skip {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }

                #ux-task-complete {
                    background: #6366f1;
                    color: white;
                }

                #ux-task-skip {
                    background: #f3f4f6;
                    color: #333;
                }

                #ux-task-complete:hover {
                    background: #4f46e5;
                }

                #ux-task-skip:hover {
                    background: #e5e7eb;
                }

                #ux-task-content.hidden {
                    display: none;
                }
            </style>

            <script>
                const tasks = [
                    {
                        id: 1,
                        title: "Find the About page",
                        text: "Explore the website and find the About page."
                    },
                    {
                        id: 2,
                        title: "Find the contact information",
                        text: "Explore the website and find the contact information."
                    }
                ];

                let currentTask = 0;

                const taskContent =
                    document.getElementById("ux-task-content");

                const minimizeButton =
                    document.getElementById("ux-task-minimize");

                const completeButton =
                    document.getElementById("ux-task-complete");

                const skipButton =
                    document.getElementById("ux-task-skip");

                const progress =
                    document.getElementById("ux-task-progress");

                const title =
                    document.getElementById("ux-task-title");

                const text =
                    document.getElementById("ux-task-text");


                function showTask() {

                    const task = tasks[currentTask];

                    progress.textContent =
                        "Task " + (currentTask + 1) +
                        " of " + tasks.length;

                    title.textContent = task.title;

                    text.textContent = task.text;
                }


                function nextTask() {

                    currentTask++;

                    if (currentTask >= tasks.length) {

                        taskContent.innerHTML = \`
                            <div style="text-align: center;">
                               

                                <h3>
                                    Testing Complete!
                                </h3>

                                <p>
                                    Thank you for completing the usability test.
                                </p>

                                <button
                                    id="ux-task-done"
                                    style="
                                        width: 100%;
                                        padding: 10px;
                                        border: none;
                                        border-radius: 8px;
                                        background: #f163ec;
                                        color: white;
                                        font-weight: 600;
                                        cursor: pointer;
                                    "
                                >
                                    Done
                                </button>
                            </div>
                        \`;

                        document
                            .getElementById("ux-task-done")
                            .addEventListener("click", () => {

                                const sessionId =
                                    sessionStorage.getItem(
                                        \`trackerSessionId_${studyId}\`
                                    );

                                window.location.href =
                                    "/feedback" +
                                    "?studyId=" + ${studyId} +
                                    "&sessionId=" +
                                    encodeURIComponent(sessionId);
                            });

                        return;
                    }

                    showTask();
                }


                completeButton.addEventListener("click", () => {

                    const task = tasks[currentTask];

                    const sessionId=
                        sessionStorage.getItem('trackerSessionId_${studyId}');

                    console.log("Task completed:", task);

                    fetch("/api/events", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            studyId: ${studyId},
                            sessionId: sessionId,
                            type: "TASK_COMPLETED",
                            url: window.location.href,
                            timestamp: new Date().toISOString(),
                            taskId: task.id,
                            taskTitle: task.title
                        })
                    });

                    nextTask();
                });


                skipButton.addEventListener("click", () => {

                    const task = tasks[currentTask];

                    console.log("Task skipped:", task);

                    fetch("/api/events", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            studyId: ${studyId},
                            sessionId: sessionId,
                            type: "TASK_SKIPPED",
                            url: window.location.href,
                            timestamp: new Date().toISOString(),
                            taskId: task.id,
                            taskTitle: task.title
                        })
                    });

                    nextTask();
                });

                minimizeButton.addEventListener("click", () => {
                    taskContent.classList.toggle("hidden");
                });


                showTask();
            </script>
        `;
        if (html.includes("</head>")) {
            html = html.replace(
                "</head>",
                `${trackerScript}</head>`
            );
        }

        html = html.replace(
            "</body>",
            `${participantOverlay}</body>`
        );

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


    const taskResults = db.prepare(`
        SELECT
            json_extract(data, '$.taskId') AS taskId,
            json_extract(data, '$.taskTitle') AS taskTitle,
            SUM(
                CASE
                    WHEN type = 'TASK_COMPLETED'
                    THEN 1
                    ELSE 0
                END
            ) AS completed,
            SUM(
                CASE
                    WHEN type = 'TASK_SKIPPED'
                    THEN 1
                    ELSE 0
                END
            ) AS skipped
        FROM events
        WHERE study_id = ?
        AND type IN ('TASK_COMPLETED', 'TASK_SKIPPED')
        GROUP BY taskId, taskTitle
        ORDER BY taskId
    `).all(studyId);


    const feedbackSummary = db.prepare(`
        SELECT
            COUNT(*) AS responses,
            ROUND(AVG(ease_of_use), 1) AS averageEaseOfUse,
            ROUND(AVG(task_ease), 1) AS averageTaskEase
        FROM feedback
        WHERE study_id = ?
    `).get(studyId);


    const feedbackComments = db.prepare(`
        SELECT
            ease_of_use AS easeOfUse,
            task_ease AS taskEase,
            confusing,
            additional_feedback AS additionalFeedback,
            created_at AS createdAt
        FROM feedback
        WHERE study_id = ?
        ORDER BY id DESC
    `).all(studyId);

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
        screenshotUrl: screenshotUrl,
        taskResults: taskResults,
        feedbackSummary: feedbackSummary,
        feedbackComments: feedbackComments
    });
});

app.post("/api/studies/:studyId/participant-links", (req, res) => {

    try {

        const studyId = Number(req.params.studyId);

        // Make sure the study exists
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

        // Generate unique participant token
        const token = crypto.randomBytes(16).toString("hex");

        const createdAt =
            new Date().toISOString();

        const insert = db.prepare(`
            INSERT INTO participant_links (
                study_id,
                token,
                created_at
            )
            VALUES (?, ?, ?)
        `);

        insert.run(
            studyId,
            token,
            createdAt
        );

        const participantLink =
            `http://localhost:3000/participant/${token}`;

        res.status(201).json({
            success: true,
            participantLink,
            token,
            studyId,
            createdAt
        });

    } catch (error) {

        console.error(
            "Error creating participant link:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Could not create participant link."
        });

    }

});

app.get("/feedback", (req, res) => {

    const studyId = req.query.studyId;
    const sessionId = req.query.sessionId;

    if (!studyId || !sessionId) {
        return res.status(400).send(`
            <h1>Invalid feedback link</h1>
            <p>We could not identify your testing session.</p>
        `);
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Usability Test Feedback</title>

            <style>
                body {
                    margin: 0;
                    padding: 40px 20px;
                    background: #f5f7ff;
                    font-family: Arial, sans-serif;
                    color: #222;
                }

                .feedback-container {
                    max-width: 650px;
                    margin: 0 auto;
                    background: white;
                    padding: 35px;
                    border-radius: 16px;
                    box-shadow:
                        0 8px 30px rgba(0, 0, 0, 0.08);
                }

                h1 {
                    margin-top: 0;
                    color: #6366f1;
                }

                .intro {
                    color: #666;
                    line-height: 1.6;
                }

                .question {
                    margin-top: 28px;
                }

                .question label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 10px;
                }

                .rating {
                    display: flex;
                    gap: 10px;
                }

                .rating label {
                    cursor: pointer;
                    font-weight: normal;
                }

                textarea {
                    width: 100%;
                    min-height: 100px;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                    resize: vertical;
                }

                button {
                    width: 100%;
                    margin-top: 30px;
                    padding: 13px;
                    border: none;
                    border-radius: 8px;
                    background: #6366f1;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                }

                button:hover {
                    background: #4f46e5;
                }
            </style>
        </head>

        <body>

            <div class="feedback-container">

                <h1> Testing Complete!</h1>

                <p class="intro">
                    Thank you for completing the usability test!
                    Please take a moment to share your experience.
                </p>

                <form method="POST" action="/feedback">

                    <input
                        type="hidden"
                        name="studyId"
                        value="${studyId}"
                    >

                    <input
                        type="hidden"
                        name="sessionId"
                        value="${sessionId}"
                    >

                    <div class="question">

                        <label>
                            How easy was the website to use?
                        </label>

                        <div class="rating">
                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="1"
                                    required
                                >
                                1
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="2"
                                >
                                2
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="3"
                                >
                                3
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="4"
                                >
                                4
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="5"
                                >
                                5
                            </label>
                        </div>

                    </div>


                    <div class="question">

                        <label>
                            How easy were the tasks to complete?
                        </label>

                        <div class="rating">
                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="1"
                                    required
                                >
                                1
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="2"
                                >
                                2
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="3"
                                >
                                3
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="4"
                                >
                                4
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="5"
                                >
                                5
                            </label>
                        </div>

                    </div>


                    <div class="question">

                        <label>
                            Was anything confusing or difficult?
                        </label>

                        <textarea
                            name="confusing"
                            placeholder="Tell us about anything that was confusing..."
                        ></textarea>

                    </div>


                    <div class="question">

                        <label>
                            Any additional feedback?
                        </label>

                        <textarea
                            name="additionalFeedback"
                            placeholder="Share any other thoughts..."
                        ></textarea>

                    </div>


                    <button type="submit">
                        Submit Feedback
                    </button>

                </form>

            </div>

        </body>
        </html>
    `);
});

app.post("/feedback", (req, res) => {

    try {

        const {
            studyId,
            sessionId,
            easeOfUse,
            taskEase,
            confusing,
            additionalFeedback
        } = req.body;

        if (!studyId || !sessionId) {
            return res.status(400).send(
                "Missing study or session information."
            );
        }

        const createdAt =
            new Date().toISOString();

        const insert = db.prepare(`
            INSERT INTO feedback (
                study_id,
                session_id,
                ease_of_use,
                task_ease,
                confusing,
                additional_feedback,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
            studyId,
            sessionId,
            easeOfUse,
            taskEase,
            confusing || "",
            additionalFeedback || "",
            createdAt
        );

        console.log(
            "FEEDBACK SAVED:",
            studyId,
            sessionId
        );

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Thank You</title>

                <style>
                    body {
                        margin: 0;
                        padding: 60px 20px;
                        background: #f5f7ff;
                        font-family: Arial, sans-serif;
                        text-align: center;
                    }

                    .thank-you {
                        max-width: 550px;
                        margin: 0 auto;
                        background: white;
                        padding: 40px;
                        border-radius: 16px;
                        box-shadow:
                            0 8px 30px rgba(0, 0, 0, 0.08);
                    }

                    h1 {
                        color: #bf4191;
                    }

                    p {
                        color: #666;
                        line-height: 1.6;
                    }
                </style>
            </head>

            <body>

                <div class="thank-you">

                    <h1>Thank You!</h1>

                    <p>
                        Your feedback has been submitted.
                        You can now close this window.
                    </p>

                </div>

            </body>
            </html>
        `);

    } catch (error) {

        console.error(
            "Feedback error:",
            error
        );

        res.status(500).send(
            "Could not save feedback."
        );
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});