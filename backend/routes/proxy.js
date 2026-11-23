
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const db = require("../database");

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
        const requestedUrl = req.query.url || study.target_url;

        // Ensure the URL is absolute
        const currentPageUrl = new URL(
            requestedUrl,
            study.target_url
        ).href;

        console.log("STUDY TARGET URL:", study.target_url);
        console.log("REQUESTED URL:", requestedUrl);
        console.log("Proxying:", requestedUrl);

        // Fetch the original website
        const response = await fetch(requestedUrl);

        if (!response.ok) {
            return res.status(response.status).send(
                `Could not load target website. Status: ${response.status}`
            );
        }

        let html = await response.text();

        // REWRITE LINKS
        const targetOrigin = new URL(study.target_url).origin;
        const proxyBase = `/proxy/${studyId}`;

        html = html.replace(
            /href=["']([^"']+)["']/gi,
            (match, href) => {
                if (
                    href.startsWith("#") ||
                    href.startsWith("mailto:") ||
                    href.startsWith("tel:") ||
                    href.startsWith("javascript:")
                ) {
                    return match;
                }

                try {
                    const absoluteUrl = new URL(href, currentPageUrl);

                    if (absoluteUrl.origin === targetOrigin) {
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

        // REWRITE GOOGLE SITES NAVIGATION
        html = html.replace(
            /data-url=["']([^"']+)["']/gi,
            (match, path) => {
                try {
                    const absoluteUrl = new URL(path, currentPageUrl);

                    if (absoluteUrl.origin === targetOrigin) {
                        return `data-url="${proxyBase}?url=${encodeURIComponent(
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

        // FIND THE BUILT OVERLAY CSS FILE
        const assetsDirectory = path.join(
            __dirname,
            "../../frontend/dist/assets"
        );

        const cssFile = fs.readdirSync(assetsDirectory)
            .find(file => file.startsWith("taskOverlay") && file.endsWith(".css"));

        const overlayScript = `
            <link rel="stylesheet" href="/task-overlay/${cssFile}">
            <script type="module" src="/task-overlay/taskOverlay.js"></script>        `;

        // INJECT BOTH SCRIPTS
        if (html.includes("</head>")) {
            html = html.replace(
                "</head>",
                `${trackerScript}${overlayScript}</head>`
            );
        }


        // Send modified HTML back to participant
        res.send(html);

    } catch (error) {
        console.error("Proxy error:", error);

        res.status(500).send(
            "Could not load the target website."
        );
    }
});

module.exports = router;
