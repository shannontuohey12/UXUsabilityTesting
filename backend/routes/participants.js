const express = require("express");
const router = express.Router();

const db = require("../database");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");

// Create unique participant link
router.post("/:studyId/participant-links", requireAuth, (req, res) => {
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

        const createdAt = new Date().toISOString();

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


// get unique participant link route -- redirects to the study proxy page
router.get("/participant/:token", (req, res) => {

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




module.exports = router;