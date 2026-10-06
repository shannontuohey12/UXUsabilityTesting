
// this is for the task overlay that will be injected into the participant's page
function createTaskOverlay(tasks = []) {
    return `
        <style>
            /* =========================
               TASK OVERLAY
               ========================= */

            #ux-task-overlay {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                max-width: calc(100vw - 40px);

                background: white;
                border-radius: 16px;
                padding: 20px;

                box-shadow:
                    0 8px 30px rgba(0, 0, 0, 0.15);

                z-index: 999999;

                font-family:
                    Arial,
                    sans-serif;

                color: #333;
            }

            #ux-task-overlay h2 {
                margin-top: 0;
                margin-bottom: 10px;
                color: #bf4191;
            }

            #ux-task-overlay p {
                line-height: 1.5;
                margin-bottom: 15px;
            }

            .ux-task {
                padding: 12px;
                margin-bottom: 10px;

                background: #f5f7ff;
                border-radius: 10px;
            }

            .ux-task.completed {
                background: #e8f7ee;
            }

            .ux-task button {
                margin-top: 8px;
                padding: 8px 14px;

                border: none;
                border-radius: 8px;

                background: #bf4191;
                color: white;

                cursor: pointer;
            }

            .ux-task button:hover {
                opacity: 0.9;
            }

            #ux-close-overlay {
                position: absolute;
                top: 10px;
                right: 12px;

                border: none;
                background: transparent;

                font-size: 20px;
                cursor: pointer;
                color: #777;
            }

            #ux-progress {
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
            }
        </style>

        <div id="ux-task-overlay">

            <button id="ux-close-overlay">
                ×
            </button>

            <h2>Usability Test</h2>

            <p>
                Please complete the following tasks on this website.
            </p>

            <div id="ux-progress">
                Task 0 of ${tasks.length}
            </div>

            <div id="ux-task-list">

                ${tasks.map((task, index) => `
                    <div
                        class="ux-task"
                        data-task-index="${index}"
                    >
                        <strong>
                            Task ${index + 1}
                        </strong>

                        <p>
                            ${task.description || task}
                        </p>

                        <button
                            onclick="completeUXTask(${index})"
                        >
                            Mark Task Complete
                        </button>
                    </div>
                `).join("")}

            </div>

        </div>

        <script>

            // =========================
            // TASK OVERLAY LOGIC
            // =========================

            let completedTasks = [];

            window.completeUXTask = function(index) {

                if (!completedTasks.includes(index)) {
                    completedTasks.push(index);
                }

                const task = document.querySelector(
                    '[data-task-index="' + index + '"]'
                );

                if (task) {
                    task.classList.add("completed");
                }

                updateUXProgress();
            };


            function updateUXProgress() {

                const progress =
                    document.getElementById("ux-progress");

                if (!progress) {
                    return;
                }

                progress.textContent =
                    "Task " +
                    completedTasks.length +
                    " of " +
                    ${tasks.length};
            }


            // Close overlay

            const closeButton =
                document.getElementById("ux-close-overlay");

            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    function() {

                        const overlay =
                            document.getElementById(
                                "ux-task-overlay"
                            );

                        if (overlay) {
                            overlay.remove();
                        }

                    }
                );

            }

        </script>
    `;
}

module.exports = {
    createTaskOverlay
};