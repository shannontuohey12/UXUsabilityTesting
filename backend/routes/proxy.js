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

        // Ensure the URL is absolute
        const currentPageUrl = new URL(
            requestedUrl,
            study.target_url
        ).href;
        console.log("STUDY TARGET URL:", study.target_url);
        console.log("REQUESTED URL:", requestedUrl);

        console.log("Proxying:", requestedUrl);

        // Fetches the original website by sending a request to the target URL and getting the response back
        const response = await fetch(requestedUrl); 

        if (!response.ok) {
            return res.status(response.status).send(
                `Could not load target website. Status: ${response.status}`
            );
        }
        //Reads response body as text and stores it in a variable called html. This is the HTML content of the target website that will be modified and sent back to the participant.
        let html = await response.text(); 

        // REWRITE LINKS

        const targetOrigin = new URL(study.target_url).origin;
        const proxyBase = `/proxy/${studyId}`;

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
                    const absoluteUrl = new URL(
                        href,
                        currentPageUrl
                    );

                    // Only proxy links belonging
                    // to the target website
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
                    const absoluteUrl = new URL(
                        path,
                        requestedUrl
                    ); //produces an absolute URL based on the relative path and the requested URL. This ensures that the link is correctly resolved even if it's a relative link.

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

        const tasks = db.prepare(`
            SELECT id, title, instructions, position
            FROM study_tasks
            WHERE study_id = ?
            ORDER BY position ASC
        `).all(studyId);

        const participantOverlay = createTaskOverlay(tasks, studyId);       
        
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

        //sends modified HTML back to the participant's browser, which will render the target website with the injected tracker and task overlay.
        res.send(html); 

    } catch (error) {

        console.error("Proxy error:", error);

        res.status(500).send(
            "Could not load the target website."
        );

    }

});

module.exports = router;