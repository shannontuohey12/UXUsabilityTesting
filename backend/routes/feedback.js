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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You | Rooted Insights</title>

    <style>
        :root {
            --teal: #397D78;
            --teal-dark: #285E5A;
            --sage: #DCE8D9;
            --cream: #FAFBF7;
            --text: #263B36;
            --muted: #71817A;
            --border: #E0E8DF;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            padding: 40px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
                radial-gradient(
                    circle at top left,
                    #E6EFE3 0,
                    transparent 45%
                ),
                var(--cream);
            font-family: -apple-system, BlinkMacSystemFont,
                "Segoe UI", sans-serif;
            color: var(--text);
        }

        .page {
            width: 100%;
            max-width: 560px;
            text-align: center;
        }

        .brand {
            margin-bottom: 28px;
        }

        .brand-logo {
            display: block;
            width: 220px;
            max-width: 80%;
            height: auto;
            margin: 0 auto;
        }

        .thank-you {
            padding: 44px 36px;
            background: white;
            border: 1px solid var(--border);
            border-radius: 24px;
            box-shadow: 0 16px 45px rgba(42, 77, 64, 0.08);
        }

        .success-icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: var(--sage);
            color: var(--teal-dark);
            font-size: 34px;
        }

        h1 {
            margin: 0 0 16px;
            color: var(--teal-dark);
            font-size: clamp(26px, 5vw, 34px);
            line-height: 1.25;
            letter-spacing: -0.8px;
        }

        p {
            margin: 0 0 18px;
            color: var(--muted);
            font-size: 16px;
            line-height: 1.8;
        }

        .note {
            margin-top: 26px;
            padding: 16px;
            background: #F0F5ED;
            border-radius: 14px;
            color: var(--teal-dark);
            font-size: 14px;
            line-height: 1.7;
        }

        .footer {
            margin-top: 24px;
            color: var(--muted);
            font-size: 13px;
        }

        @media (max-width: 480px) {
            .thank-you {
                padding: 36px 24px;
            }
        }
    </style>
</head>

<body>
    <main class="page">
        <div class="brand">
            <img
                class="brand-logo"
                src="/assets/RootedInsights.svg"
                alt="Rooted Insights logo"
            >
        </div>

        <section class="thank-you">
            <div class="success-icon" aria-hidden="true">✓</div>

            <h1>Thank You for Helping Us Grow!</h1>

            <p>
                Your feedback has been submitted successfully.
            </p>

            <p>
                Your perspective helps researchers understand
                real user experiences and discover ways to make
                websites clearer, easier, and more enjoyable to use.
            </p>

            <div class="note">
                Your time and insights make a difference.
                Thank you for being part of the process!
            </div>
        </section>

        <div class="footer">
            Powered by Rooted Insights · Putting users first
        </div>
    </main>
</body>
</html> `);


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