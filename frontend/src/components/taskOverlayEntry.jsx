
import { createRoot } from "react-dom/client";
import TaskOverlay from "./taskOverlay";

(async function initializeTaskOverlay() {
    if (window.__uxTaskOverlayLoaded) return;

    window.__uxTaskOverlayLoaded = true;

    // Get the study ID saved by tracker.js
    const studyId = sessionStorage.getItem("uxStudyId");

    if (!studyId) {
        console.error("TaskOverlay: No study ID found.");
        window.__uxTaskOverlayLoaded = false;
        return;
    }

    try {
        // Get tasks from the backend
        const response = await fetch(
            `/api/studies/${encodeURIComponent(studyId)}/tasks`
        );

        if (!response.ok) {
            throw new Error("Could not load study tasks.");
        }

        const tasks = await response.json();

        if (!Array.isArray(tasks) || tasks.length === 0) {
            console.error("TaskOverlay: No tasks found.");
            window.__uxTaskOverlayLoaded = false;
            return;
        }

        // Create the overlay container
        const container = document.createElement("div");
        container.id = "ux-task-overlay-root";
        document.body.appendChild(container);

        const root = createRoot(container);

        root.render(
            <TaskOverlay
                tasks={tasks}
                studyId={studyId}
                onClose={() => {
                    root.unmount();
                    container.remove();
                    window.__uxTaskOverlayLoaded = false;
                }}
            />
        );

    } catch (error) {
        console.error("TaskOverlay initialization error:", error);
        window.__uxTaskOverlayLoaded = false;
    }
})();
