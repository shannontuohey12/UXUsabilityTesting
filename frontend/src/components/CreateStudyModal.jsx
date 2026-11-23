
function CreateStudyModal({
    showCreateStudy,
    setShowCreateStudy,
    error,
    newStudyName,
    setNewStudyName,
    newStudyUrl,
    setNewStudyUrl,
    newStudyTasks,
    updateStudyTask,
    moveStudyTask,
    removeStudyTask,
    addStudyTask,
    createStudy,
    creatingStudy
}) {
    if (!showCreateStudy) return null;

    return (
        <div
            className="modal-backdrop"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    setShowCreateStudy(false);
                }
            }}
        >
            <section
                className="create-study-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-study-title"
            >
                <div className="create-study-header">
                    <div>
                        <h2 id="create-study-title">Create a New Study</h2>
                        <p>Enter the website you want participants to test.</p>
                    </div>

                    <button
                        type="button"
                        className="close-button"
                        onClick={() => setShowCreateStudy(false)}
                        aria-label="Close form"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="inline-error" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={createStudy}>
                    <label htmlFor="study-name">Study Name</label>
                    <input
                        id="study-name"
                        type="text"
                        placeholder="Portfolio Usability Test"
                        value={newStudyName}
                        onChange={(event) => setNewStudyName(event.target.value)}
                        required
                    />

                    <label htmlFor="study-url">Website URL</label>
                    <input
                        id="study-url"
                        type="url"
                        placeholder="https://example.com"
                        value={newStudyUrl}
                        onChange={(event) => setNewStudyUrl(event.target.value)}
                        required
                    />

                    <div className="study-tasks-builder">
                        <h3>Usability Tasks</h3>
                        <p>
                            Define the tasks participants should complete on your website.
                        </p>

                        {newStudyTasks.map((task, index) => (
                            <div className="study-task-card" key={index}>
                                <div className="study-task-heading">
                                    <h4>Task {index + 1}</h4>

                                    <div className="study-task-actions">
                                        <button
                                            type="button"
                                            onClick={() => moveStudyTask(index, -1)}
                                            disabled={index === 0}
                                            aria-label={`Move task ${index + 1} up`}
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => moveStudyTask(index, 1)}
                                            disabled={index === newStudyTasks.length - 1}
                                            aria-label={`Move task ${index + 1} down`}
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => removeStudyTask(index)}
                                            disabled={newStudyTasks.length === 1}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <label htmlFor={`task-title-${index}`}>
                                    Task Title
                                </label>
                                <input
                                    id={`task-title-${index}`}
                                    value={task.title}
                                    onChange={(event) =>
                                        updateStudyTask(index, "title", event.target.value)
                                    }
                                    placeholder="e.g. Find the about page"
                                    required
                                />

                                <label htmlFor={`task-instructions-${index}`}>
                                    Task {index + 1} Description
                                </label>
                                <textarea
                                    id={`task-instructions-${index}`}
                                    value={task.instructions}
                                    onChange={(event) =>
                                        updateStudyTask(
                                            index,
                                            "instructions",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Click through to the about page..."
                                    required
                                />
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addStudyTask}
                            className="add-study-task-button"
                        >
                            + Add Task
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="create-study-submit"
                        disabled={creatingStudy}
                    >
                        {creatingStudy ? "Creating..." : "Create Study"}
                    </button>
                </form>
            </section>
        </div>
    );
}

export default CreateStudyModal;
