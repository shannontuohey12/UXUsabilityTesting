
function createTaskOverlay(tasks = [], studyId) {
    const safeTasks = JSON.stringify(
        tasks.map((task) => ({
            title: task.title || "Untitled task",
            instructions: task.instructions || ""
        }))
    ).replace(/</g, "\\u003c");

    return `
        <style>
            #ux-task-overlay {
                --ux-teal: #397D78;
                --ux-teal-dark: #285E5A;
                --ux-sage: #DCE8D9;
                --ux-cream: #FAFBF7;
                --ux-text: #263B36;
                --ux-muted: #71817A;
                --ux-border: #E0E8DF;

                position: fixed;
                top: 20px;
                right: 20px;
                width: 370px;
                max-width: calc(100vw - 40px);
                max-height: calc(100vh - 40px);
                overflow-y: auto;
                box-sizing: border-box;
                padding: 24px;
                background: var(--ux-cream);
                border: 1px solid var(--ux-border);
                border-radius: 22px;
                box-shadow: 0 16px 45px rgba(42, 77, 64, 0.18);
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont,
                    "Segoe UI", sans-serif;
                color: var(--ux-text);
                line-height: 1.6;
            }

            #ux-task-overlay *,
            #ux-task-overlay *::before,
            #ux-task-overlay *::after {
                box-sizing: border-box;
            }

            #ux-task-overlay .ux-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                padding-bottom: 18px;
                margin-bottom: 22px;
                border-bottom: 1px solid var(--ux-border);
            }

            #ux-task-overlay .ux-logo {
                display: block;
                width: 145px;
                max-width: calc(100% - 35px);
                max-height: 45px;
                object-fit: contain;
                object-position: left center;
            }

            #ux-task-overlay #ux-close-overlay {
                position: absolute;
                top: 18px;
                right: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                padding: 0;
                border: 1px solid var(--ux-border);
                border-radius: 50%;
                background: white;
                color: var(--ux-muted);
                font-size: 21px;
                line-height: 1;
                cursor: pointer;
                transition: background 0.2s, color 0.2s;
            }

            #ux-task-overlay #ux-close-overlay:hover {
                background: var(--ux-sage);
                color: var(--ux-teal-dark);
            }

            #ux-task-overlay .ux-eyebrow {
                margin: 0 0 6px;
                color: var(--ux-teal);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
            }

            #ux-task-overlay h2 {
                margin: 0 0 10px;
                color: var(--ux-teal-dark);
                font-size: 25px;
                font-weight: 700;
                line-height: 1.25;
                letter-spacing: -0.6px;
            }

            #ux-task-overlay p {
                margin: 0 0 18px;
                color: var(--ux-muted);
                font-size: 14px;
                line-height: 1.7;
            }

            #ux-task-overlay #ux-progress {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin: 20px 0 12px;
                color: var(--ux-teal-dark);
                font-size: 12px;
                font-weight: 700;
            }

            #ux-task-overlay .ux-progress-track {
                width: 100%;
                height: 6px;
                margin-bottom: 20px;
                overflow: hidden;
                border-radius: 99px;
                background: var(--ux-sage);
            }

            #ux-task-overlay .ux-progress-fill {
                height: 100%;
                border-radius: 99px;
                background: var(--ux-teal);
                transition: width 0.25s ease;
            }

            #ux-task-overlay .ux-task {
                padding: 20px;
                background: white;
                border: 1px solid var(--ux-border);
                border-radius: 16px;
                box-shadow: 0 5px 16px rgba(42, 77, 64, 0.04);
            }

            #ux-task-overlay .ux-task-label {
                display: block;
                margin-bottom: 8px;
                color: var(--ux-teal);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
            }

            #ux-task-overlay .ux-task strong {
                display: block;
                margin-bottom: 8px;
                color: var(--ux-text);
                font-size: 17px;
                line-height: 1.4;
                overflow-wrap: anywhere;
            }

            #ux-task-overlay .ux-task p {
                margin-bottom: 18px;
                overflow-wrap: anywhere;
            }

            #ux-task-overlay .ux-button {
                display: block;
                width: 100%;
                min-height: 44px;
                margin-top: 10px;
                padding: 11px 16px;
                border: 1px solid transparent;
                border-radius: 10px;
                background: var(--ux-teal);
                color: white;
                font-family: inherit;
                font-size: 14px;
                font-weight: 650;
                cursor: pointer;
                transition: background 0.2s, transform 0.2s;
            }

            #ux-task-overlay .ux-button:hover {
                background: var(--ux-teal-dark);
            }

            #ux-task-overlay .ux-button:focus-visible,
            #ux-task-overlay #ux-close-overlay:focus-visible {
                outline: 3px solid #8CBAB0;
                outline-offset: 3px;
            }

            #ux-task-overlay .ux-secondary-button {
                background: white;
                color: var(--ux-teal-dark);
                border-color: var(--ux-border);
            }

            #ux-task-overlay .ux-secondary-button:hover {
                background: var(--ux-sage);
            }

            #ux-task-overlay .ux-complete-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 62px;
                height: 62px;
                margin: 8px 0 22px;
                border-radius: 50%;
                background: var(--ux-sage);
                color: var(--ux-teal-dark);
                font-size: 30px;
            }

            #ux-task-overlay .ux-footer {
                margin: 20px 0 0;
                color: var(--ux-muted);
                font-size: 11px;
                text-align: center;
            }

            @media (max-width: 480px) {
                #ux-task-overlay {
                    top: 10px;
                    right: 10px;
                    width: calc(100vw - 20px);
                    max-width: none;
                    max-height: calc(100vh - 20px);
                    padding: 20px;
                    border-radius: 18px;
                }

                #ux-task-overlay h2 {
                    font-size: 23px;
                }
            }
        </style>

        <div id="ux-task-overlay">
            <button
                id="ux-close-overlay"
                type="button"
                aria-label="Close task instructions"
                title="Close task instructions"
            >×</button>

            <div class="ux-brand">
                <img
                    class="ux-logo"
                    src="/assets/RootedInsights.svg"
                    alt="Rooted Insights"
                >
            </div>

            <div id="ux-task-content"></div>

            <p class="ux-footer">
                Powered by Rooted Insights
            </p>
        </div>

        <script>
            (function () {
                const tasks = ${safeTasks};
                const studyId = ${JSON.stringify(studyId)};
                let currentTask = 0;
                let completedTasks = [];
                async function recordTaskResult(task, status) {
                    const sessionId = sessionStorage.getItem(
                        "trackerSessionId_" + studyId
                    );

                    if (!studyId || !sessionId) {
                        console.error("Cannot record task result: missing session details", {
                            studyId,
                            sessionId
                        });
                        return;
                    }

                    try {
                        const response = await fetch("/api/events", {
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
                            console.error(
                                "Failed to save task result:",
                                response.status,
                                await response.text()
                            );
                        }
                    } catch (error) {
                        console.error("Error recording task result:", error);
                    }
                }

                const overlay = document.getElementById("ux-task-overlay");
                const content = document.getElementById("ux-task-content");

                if (!overlay || !content) return;

                function renderTask() {
                    if (currentTask >= tasks.length) {
                        content.innerHTML = \`
                            <div class="ux-complete-icon" aria-hidden="true">✓</div>
                            <p class="ux-eyebrow">All done</p>
                            <h2>Thank You for Helping Us Grow!</h2>
                            <p>
                                You've reached the end of the tasks.
                                Thank you for taking the time to participate.
                                Your feedback helps make websites easier to use.
                            </p>
                            <button
                                id="ux-done-button"
                                class="ux-button"
                                type="button"
                            >Share Your Feedback →</button>
                        \`;

                        document.getElementById("ux-done-button")
                            .addEventListener("click", function () {
                                const sessionId = sessionStorage.getItem(
                                    "trackerSessionId_" + studyId
                                );

                                if (!studyId || !sessionId) {
                                    console.error("Missing feedback details:", {
                                        studyId,
                                        sessionId
                                    });

                                    alert(
                                        "We couldn't identify your testing session. Please try refreshing the page."
                                    );
                                    return;
                                }

                                const feedbackUrl =
                                    "/feedback?studyId=" +
                                    encodeURIComponent(studyId) +
                                    "&sessionId=" +
                                    encodeURIComponent(sessionId);

                                window.location.href = feedbackUrl;
                            });

                        return;
                    }

                    const task = tasks[currentTask];
                    const progress = tasks.length
                        ? ((currentTask + 1) / tasks.length) * 100
                        : 0;

                    content.innerHTML = \`
                        <p class="ux-eyebrow">Your usability study</p>
                        <h2>Let's get started</h2>
                        <p>
                            Complete each task below as naturally as you can.
                            There are no right or wrong answers.
                        </p>

                        <div id="ux-progress">
                            <span>Task \${currentTask + 1} of \${tasks.length}</span>
                            <span>\${Math.round(progress)}%</span>
                        </div>

                        <div class="ux-progress-track" aria-hidden="true">
                            <div
                                class="ux-progress-fill"
                                style="width: \${progress}%"
                            ></div>
                        </div>

                        <div class="ux-task">
                            <span class="ux-task-label">Your next task</span>
                            <strong>\${escapeHTML(task.title)}</strong>
                            <p>\${escapeHTML(task.instructions)}</p>

                            <button
                                id="ux-complete-button"
                                class="ux-button"
                                type="button"
                            >✓ &nbsp; Completed</button>

                            <button
                                id="ux-skip-button"
                                class="ux-button ux-secondary-button"
                                type="button"
                            >Skip this task</button>
                        </div>
                    \`;

                    document.getElementById("ux-complete-button")
                        .addEventListener("click", async function () {
                            const task = tasks[currentTask];

                            this.disabled = true;

                            await recordTaskResult(task, "completed");

                            completedTasks.push(currentTask);
                            nextTask();
                        });

                    document.getElementById("ux-skip-button")
                        .addEventListener("click", async function () {
                            const task = tasks[currentTask];

                            this.disabled = true;

                            await recordTaskResult(task, "skipped");

                            nextTask();
                        });
                }

                function nextTask() {
                    currentTask++;
                    renderTask();
                }

                function escapeHTML(value) {
                    return String(value).replace(/[&<>"']/g, function (char) {
                        return {
                            "&": "&amp;",
                            "<": "&lt;",
                            ">": "&gt;",
                            '"': "&quot;",
                            "'": "&#39;"
                        }[char];
                    });
                }

                document.getElementById("ux-close-overlay")
                    .addEventListener("click", function () {
                        overlay.remove();
                    });

                renderTask();
            })();
        </script>
    `;
}

module.exports = { createTaskOverlay };
