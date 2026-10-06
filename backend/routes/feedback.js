const express = require("express");
const router = express.Router();

const db = require("../database");

const { createFeedbackPage } = require("../views/feedbackPage");

router.get("/", (req, res) => {

    const studyId = req.query.studyId;
    const sessionId = req.query.sessionId;

    if (!studyId || !sessionId) {
        return res.status(400).send(`
            <h1>Invalid feedback link</h1>
            <p>We could not identify your testing session.</p>
        `);
    }

    res.send(createFeedbackPage(studyId, sessionId));
});

router.post("/", (req, res) => {

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

module.exports = router;