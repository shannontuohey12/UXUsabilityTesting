const express = require("express");
const router = express.Router();

const db = require("../database");
const { captureWebsiteScreenshot } = require("../services/screenshotService");
const { requireAuth } = require("../middleware/auth");

 // Create a study and save its usability tasks
router.post("/", requireAuth, (req, res) => {
    console.log("REQUEST BODY:", req.body);

    const name = req.body.name;
    const targetUrl = req.body.targetUrl;
    const tasks = req.body.tasks;

    if (!name || !targetUrl) {
        return res.status(400).json({
            success: false,
            message: "Study name and target URL are required."
        });
    }

    if (
        !Array.isArray(tasks) ||
        tasks.length === 0 ||
        tasks.some(
            (task) =>
                !task.title?.trim() ||
                !task.instructions?.trim()
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide at least one task with a title and instructions."
        });
    }

    const createdAt = new Date().toISOString();

    // Insert the study and its tasks as one transaction
    const createStudyTransaction = db.transaction(() => {
        const insertStudy = db.prepare(`
            INSERT INTO studies (
                name,
                target_url,
                created_at,
                researcher_id
            )
            VALUES (?, ?, ?, ?)
        `);

        const result = insertStudy.run(
            name.trim(),
            targetUrl.trim(),
            createdAt,
            req.researcher.id
        );

        const studyId = result.lastInsertRowid;

        const insertTask = db.prepare(`
            INSERT INTO study_tasks (
                study_id,
                title,
                instructions,
                position
            )
            VALUES (?, ?, ?, ?)
        `);

        tasks.forEach((task, index) => {
            insertTask.run(
                studyId,
                task.title.trim(),
                task.instructions.trim(),
                index + 1
            );
        });

        return studyId;
    });

    try {
        const studyId = createStudyTransaction();

        // Capture the website screenshot as before
        captureWebsiteScreenshot(studyId, targetUrl.trim());

        console.log("STUDY CREATED:", studyId);
        console.log("TASKS SAVED:", tasks.length);

        return res.status(201).json({
            success: true,
            study: {
                id: studyId,
                name: name.trim(),
                targetUrl: targetUrl.trim(),
                createdAt
            },
            tasks: tasks.map((task, index) => ({
                id: index + 1,
                title: task.title.trim(),
                instructions: task.instructions.trim(),
                position: index + 1
            }))
        });
    } catch (error) {
        console.error("Error creating study:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create study."
        });
    }
});


// Get all studies
router.get("/", requireAuth, (req, res) => {
    try {
        const studies = db.prepare(`
            SELECT *
            FROM studies
            WHERE researcher_id = ?
            ORDER BY id ASC
        `).all(req.researcher.id);

        res.json(studies);
    } catch (error) {
        console.error("Error fetching studies:", error);

        res.status(500).json({
            success: false,
            message: "Could not fetch studies."
        });
    }
});

module.exports = router;