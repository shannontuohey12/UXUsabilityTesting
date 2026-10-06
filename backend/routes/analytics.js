const express = require("express");
const router = express.Router();

const db = require("../database");
const { requireAuth } = require("../middleware/auth");


// STUDY ANALYTICS

router.get("/:id/analytics", requireAuth, (req, res) => {

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


    // Get scrolling depth

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


    // Process click events

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

            console.error(
                "Error parsing click event:",
                error
            );

        }

    });


    const mostClickedElements =
        Object.entries(clickCounts)
            .map(([element, clicks]) => ({
                element,
                clicks
            }))
            .sort((a, b) => b.clicks - a.clicks);


    // Task results

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


    // Feedback summary

    const feedbackSummary = db.prepare(`
        SELECT
            COUNT(*) AS responses,
            ROUND(AVG(ease_of_use), 1) AS averageEaseOfUse,
            ROUND(AVG(task_ease), 1) AS averageTaskEase
        FROM feedback
        WHERE study_id = ?
    `).get(studyId);


    // Feedback comments

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


    // Send analytics

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

        mostClickedElements:
            mostClickedElements,

        scrollDepth: scrollDepth,

        heatmapData: heatmapData,

        screenshotUrl: screenshotUrl,

        taskResults: taskResults,

        feedbackSummary: feedbackSummary,

        feedbackComments: feedbackComments
    });
});


module.exports = router;