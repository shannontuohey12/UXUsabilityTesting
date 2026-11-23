
const express = require("express");
const router = express.Router();
const db = require("../database");

router.post("/", (req, res) => {
    const {
        studyId,
        sessionId,
        easeOfUse,
        taskEase,
        confusing,
        additionalFeedback
    } = req.body;

    if (!studyId || !sessionId || !easeOfUse || !taskEase) {
        return res.status(400).json({
            success: false,
            message: "Please complete all required fields."
        });
    }

    try {
        db.prepare(`
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
        `).run(
            studyId,
            sessionId,
            easeOfUse,
            taskEase,
            confusing || "",
            additionalFeedback || "",
            new Date().toISOString()
        );

        res.json({
            success: true,
            message: "Feedback submitted successfully!"
        });

    } catch (error) {
        console.error("Error saving feedback:", error);

        res.status(500).json({
            success: false,
            message: "Could not save feedback."
        });
    }
});

module.exports = router;
