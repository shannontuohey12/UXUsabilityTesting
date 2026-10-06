const express = require("express");
const router = express.Router();

const db = require("../database");

const { createTaskOverlay } = require("../views/taskOverlay");
// PROXY ROUTE

router.get("/:studyId", async (req, res) => {

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

        // Get the URL to load
        const requestedUrl =
            req.query.url || study.target_url;

        console.log("Proxying:", requestedUrl);

        const response = await fetch(requestedUrl);

        if (!response.ok) {
            return res.status(response.status).send(
                `Could not load target website. Status: ${response.status}`
            );
        }

        let html = await response.text(); // Get the HTML content of the target website, loads into server as text 

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

        
        // INJECT TRACKER

        const trackerUrl =
            `${req.protocol}://${req.get("host")}/tracker.js?uxStudyId=${studyId}`;

        const trackerScript = `
            <script src="${trackerUrl}"></script>
        `;

        const participantOverlay = createTaskOverlay([]); // Inject the task overlay with an empty task list
        // add tasks later ^^ 
        
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

module.exports = router;