const express = require("express");
const router = express.Router();

const db = require("../database");
const { captureWebsiteScreenshot } = require("../services/screenshotService");
const { requireAuth } = require("../middleware/auth");
// Create a study
router.post("/", requireAuth, (req, res) => {
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
            created_at,
            researcher_id
        )
        VALUES (?, ?, ?, ?)
    `);

    const result = insert.run(
        name,
        targetUrl,
        createdAt,
        req.researcher.id
    );

    const studyId = result.lastInsertRowid;

    captureWebsiteScreenshot( //captures screenshot of the study page and saves it to the screenshots folder
        studyId,
        targetUrl
    );

    console.log("STUDY CREATED:", studyId);

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