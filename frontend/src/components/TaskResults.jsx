// Success / warning / fail pill shown on each task row.
function getTaskStatus(rate) {
    if (rate >= 90) return { label: "Successful", className: "success" };
    if (rate >= 50) return { label: "Needs Improvement", className: "warning" };
    return { label: "Fail", className: "fail" };
}

function TaskResults({ taskResults }) {
    return (
        <section className="panel panel-outlined">
            <h2>Task Results</h2>

            {taskResults.length === 0 ? (
                <p className="empty-state">No task results available yet.</p>
            ) : (
                <div className="task-results">
                    {taskResults.map((task) => {
                        const completed = Number(task.completed) || 0;
                        const skipped = Number(task.skipped) || 0;
                        const total = completed + skipped;
                        const rate = total
                            ? Math.round((completed / total) * 100)
                            : 0;
                        const status = getTaskStatus(rate);

                        return (
                            <div className="task-result-row" key={task.taskId}>
                                <div className="task-result-top">
                                    <strong>
                                        Task {task.taskId}: {task.taskTitle}
                                    </strong>

                                    <div className="task-status">
                                        <span className={`status-pill ${status.className}`}>
                                            {status.label}
                                        </span>

                                        <strong className={`task-rate ${status.className}`}>
                                            {rate}%
                                        </strong>
                                    </div>
                                </div>

                                <div
                                    className="progress"
                                    role="progressbar"
                                    aria-valuenow={rate}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <span
                                        className={status.className}
                                        style={{ width: `${rate}%` }}
                                    />
                                </div>

                                <div className="task-counts">
                                    <span>{completed} Completed</span>
                                    <span>{skipped} Skipped</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default TaskResults;