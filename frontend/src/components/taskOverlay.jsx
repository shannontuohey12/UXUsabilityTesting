
import { useState } from "react";
import "./../styles/TaskOverlay.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function TaskOverlay({ tasks = [], studyId, onClose }) {
    const [currentTask, setCurrentTask] = useState(0);
    const [saving, setSaving] = useState(false);

    const sessionId = sessionStorage.getItem(
        `trackerSessionId_${studyId}`
    );

    async function recordTaskResult(task, status) {
        if (!studyId || !sessionId) {
            console.error("Missing study or session ID.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studyId: Number(studyId),
                    sessionId,
                    type: "TASK_RESULT",
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    data: {
                        taskTitle: task.title,
                        taskInstructions: task.instructions,
                        taskIndex: currentTask,
                        status
                    }
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.error("Error recording task result:", error);
        }
    }

    async function handleTask(status) {
        if (saving) return;

        setSaving(true);

        const task = tasks[currentTask];

        await recordTaskResult(task, status);

        setCurrentTask((previous) => previous + 1);
        setSaving(false);
    }

    function handleFeedback() {
        if (!studyId || !sessionId) {
            alert("We couldn't identify your testing session. Please refresh the page.");
            return;
        }

        window.location.href =
            `http://localhost:5173/feedback?studyId=${encodeURIComponent(studyId)}` +
            `&sessionId=${encodeURIComponent(sessionId)}`;
    }

    if (currentTask >= tasks.length) {
        return (
            <div id="ux-task-overlay">
                <div className="ux-brand">
                    <img
                        className="ux-logo"
                        src={`${API_URL}/assets/RootedInsights.svg`}
                        alt="Rooted Insights"
                    />
                    <button
                        id="ux-close-overlay"
                        onClick={onClose}
                        aria-label="Close task instructions"
                    >
                        ⌃
                    </button>
                </div>

                <div className="ux-complete">
                    <h2>All done!</h2>
                    <p>
                        Thank you for helping us grow! You have reached
                        the end of tasks. Your feedback makes websites
                        easier to use.
                    </p>

                    <button
                        className="ux-button"
                        onClick={handleFeedback}
                    >
                        Share My Feedback
                    </button>
                </div>

                <p className="ux-footer">Powered by Rooted Insights</p>
            </div>
        );
    }

    const task = tasks[currentTask];
    const progress = tasks.length
        ? (currentTask / tasks.length) * 100
        : 0;

    return (
        <div id="ux-task-overlay">
            <div className="ux-brand">
                <img
                    className="ux-logo"
                    src={`${API_URL}/assets/RootedInsights.svg`}
                    alt="Rooted Insights"
                />

                <button
                    id="ux-close-overlay"
                    onClick={onClose}
                    aria-label="Close task instructions"
                    title="Close task instructions"
                >
                    ⌃
                </button>
            </div>

            <p className="ux-intro">
                Thank you for participating in this usability study!
                Please complete each task below as naturally as you can.
                If you cannot figure out how to complete a task, you can
                skip the task.
            </p>

            <div className="ux-task-panel">
                <div id="ux-progress">
                    <span>Task {currentTask + 1} of {tasks.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>

                <div className="ux-progress-track">
                    <div
                        className="ux-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="ux-task">
                    <strong>{task.title || "Untitled task"}</strong>
                    <p>{task.instructions || ""}</p>

                    <div className="ux-task-buttons">
                        <button
                            className="ux-button"
                            onClick={() => handleTask("completed")}
                            disabled={saving}
                        >
                            Completed Task
                        </button>

                        <button
                            className="ux-button ux-secondary-button"
                            onClick={() => handleTask("skipped")}
                            disabled={saving}
                        >
                            Skip Task
                        </button>
                    </div>
                </div>
            </div>

            <p className="ux-footer">Powered by Rooted Insights</p>
        </div>
    );
}

export default TaskOverlay;
