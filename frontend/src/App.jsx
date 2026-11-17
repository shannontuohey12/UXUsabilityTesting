import { useEffect, useState } from "react";
import Login from "./Login";
import Navbar from "./Navbar";
import CreateAccount from "./CreateAccount";
import Home from "./Home";

import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import "./App.css";
import "./Dashboard.css";

const API_URL = "http://localhost:3000";

// Placeholder copy until each study has its own description.
const PLACEHOLDER_DESCRIPTION =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu.";

// Success / warning / fail pill shown on each task row.
function getTaskStatus(rate) {
    if (rate >= 90) return { label: "Successful", className: "success" };
    if (rate >= 50) return { label: "Needs Improvement", className: "warning" };
    return { label: "Fail", className: "fail" };
}

function formatCommentDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function Footer({ onCreateStudy, onLogout }) {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <img src="/RootedInsights.svg" alt="Rooted Insights" className="footer-logo" />
                    <p>Grow your design skills and empower users.</p>
                    <button
                        type="button"
                        className="back-to-top"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        Back to Top ↑
                    </button>
                </div>

                <nav className="footer-column" aria-label="Footer">
                    <h4>Navigation</h4>
                    <button type="button" onClick={onCreateStudy}>Create New Study</button>
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        Change Study
                    </button>
                    <button type="button" onClick={onLogout}>Log Out</button>
                </nav>

                <div className="footer-column">
                    <h4>Have any feedback?</h4>
                    <p>
                        Please email{" "}
                        <a href="mailto:shannontuohey12@gmail.com">
                            shannontuohey12@gmail.com
                        </a>{" "}
                        if you encounter any issues or want to provide feedback on
                        Rooted Insights.
                    </p>
                </div>
            </div>

            <p className="footer-copy">© 2026 Rooted Insights</p>
        </footer>
    );
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        Boolean(localStorage.getItem("sessionToken"))
    );

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [studyId, setStudyId] = useState(null);
    const [studies, setStudies] = useState([]);

    const [showCreateStudy, setShowCreateStudy] = useState(false);
    const [newStudyName, setNewStudyName] = useState("");
    const [newStudyUrl, setNewStudyUrl] = useState("");
    const [creatingStudy, setCreatingStudy] = useState(false);

    const [participantLink, setParticipantLink] = useState("");
    const [generatingLink, setGeneratingLink] = useState(false);

    const [authPage, setAuthPage] = useState("home");
    const [newStudyTasks, setNewStudyTasks] = useState([
        { title: "", instructions: "" }
    ]);

    // Used for "Welcome, Shannon!". Save this at login/account creation:
    // localStorage.setItem("userName", name)
    const userName = localStorage.getItem("userName") || "";

    const getAuthHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("sessionToken")}`
    });

    const handleLogin = () => {
        setError("");
        setLoading(true);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("sessionToken");

        setIsLoggedIn(false);
        setStudyId(null);
        setAnalytics(null);
        setStudies([]);
        setParticipantLink("");
        setShowCreateStudy(false);
        setNewStudyName("");
        setNewStudyUrl("");
        setError("");
        setLoading(true);
    };

    // Load the studies belonging to the logged-in researcher.
    useEffect(() => {
        if (!isLoggedIn) return;

        let cancelled = false;

        async function loadStudies() {
            try {
                const response = await fetch(`${API_URL}/api/studies`, {
                    headers: getAuthHeaders()
                });

                if (response.status === 401) {
                    localStorage.removeItem("sessionToken");
                    setIsLoggedIn(false);
                    throw new Error("Your session expired. Please log in again.");
                }

                if (!response.ok) {
                    throw new Error("Failed to load studies.");
                }

                const data = await response.json();

                if (cancelled) return;

                setStudies(data);
                setAnalytics(null);
                setParticipantLink("");

                if (data.length > 0) {
                    setStudyId(data[0].id);
                } else {
                    setStudyId(null);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error(err);
                    setError(err.message || "Could not load studies.");
                    setLoading(false);
                }
            }
        }

        loadStudies();

        return () => {
            cancelled = true;
        };
    }, [isLoggedIn]);

    // Load analytics whenever the selected study changes.
    useEffect(() => {
        if (!isLoggedIn || !studyId) return;

        let cancelled = false;

        async function loadAnalytics() {
            setLoading(true);
            setError("");
            setAnalytics(null);

            try {
                const response = await fetch(
                    `${API_URL}/api/studies/${studyId}/analytics`,
                    { headers: getAuthHeaders() }
                );

                if (response.status === 401) {
                    localStorage.removeItem("sessionToken");
                    setIsLoggedIn(false);
                    throw new Error("Your session expired. Please log in again.");
                }

                if (!response.ok) {
                    throw new Error("Could not load study analytics.");
                }

                const data = await response.json();

                if (!cancelled) {
                    setAnalytics(data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error(err);
                    setError(err.message || "Could not load study analytics.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadAnalytics();

        return () => {
            cancelled = true;
        };
    }, [studyId, isLoggedIn]);

    const addStudyTask = () => {
        setNewStudyTasks((current) => [
            ...current,
            { title: "", instructions: "" }
        ]);
    };

    const updateStudyTask = (index, field, value) => {
        setNewStudyTasks((current) =>
            current.map((task, i) =>
                i === index ? { ...task, [field]: value } : task
            )
        );
    };

    const removeStudyTask = (index) => {
        setNewStudyTasks((current) => current.filter((_, i) => i !== index));
    };

    const moveStudyTask = (index, direction) => {
        setNewStudyTasks((current) => {
            const updated = [...current];
            const newIndex = index + direction;

            if (newIndex < 0 || newIndex >= updated.length) {
                return current;
            }

            [updated[index], updated[newIndex]] =
                [updated[newIndex], updated[index]];

            return updated;
        });
    };

    const createStudy = async (event) => {
        event.preventDefault();

        if (!newStudyName.trim() || !newStudyUrl.trim()) {
            setError("Please enter a study name and website URL.");
            return;
        }

        if (newStudyTasks.length === 0) {
            setError("Please add at least one task.");
            return;
        }

        const invalidTask = newStudyTasks.some(
            (task) => !task.title.trim() || !task.instructions.trim()
        );

        if (invalidTask) {
            setError("Please enter a title and instructions for every task.");
            return;
        }

        setCreatingStudy(true);
        setError("");
        setParticipantLink("");

        try {
            const response = await fetch(`${API_URL}/api/studies`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    name: newStudyName.trim(),
                    targetUrl: newStudyUrl.trim(),
                    tasks: newStudyTasks.map((task, index) => ({
                        id: index + 1,
                        title: task.title.trim(),
                        instructions: task.instructions.trim(),
                        position: index + 1
                    }))
                })
            });

            if (!response.ok) {
                throw new Error("Could not create the study.");
            }

            const data = await response.json();
            const newStudy = data.study;

            if (!newStudy?.id) {
                throw new Error("The server did not return the new study.");
            }

            const studyForDropdown = {
                id: newStudy.id,
                name: newStudy.name,
                target_url: newStudy.targetUrl || newStudy.target_url
            };

            setStudies((current) => [
                ...current.filter((study) => study.id !== newStudy.id),
                studyForDropdown
            ]);

            setStudyId(newStudy.id);
            setNewStudyName("");
            setNewStudyUrl("");
            setNewStudyTasks([{ title: "", instructions: "" }]);
            setShowCreateStudy(false);
        } catch (err) {
            console.error(err);
            setError(err.message || "Could not create study.");
        } finally {
            setCreatingStudy(false);
        }
    };

    const generateParticipantLink = async () => {
        if (!studyId) return;

        setGeneratingLink(true);
        setParticipantLink("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/studies/${studyId}/participant-links`,
                {
                    method: "POST",
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error("Could not generate a participant link.");
            }

            const data = await response.json();
            setParticipantLink(data.participantLink);
        } catch (err) {
            console.error(err);
            setError(err.message || "Could not generate a participant link.");
        } finally {
            setGeneratingLink(false);
        }
    };

    const copyParticipantLink = async () => {
        try {
            await navigator.clipboard.writeText(participantLink);
        } catch (err) {
            console.error(err);
            setError("Could not copy the link. Please copy it manually.");
        }
    };

    // ---------- Shared pieces (defined once, used in both views) ----------

    const createStudyModal = showCreateStudy && (
        <div
            className="modal-backdrop"
            onClick={(event) => {
                if (event.target === event.currentTarget) setShowCreateStudy(false);
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

                                <label htmlFor={`task-title-${index}`}>Task Title</label>
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
                                        updateStudyTask(index, "instructions", event.target.value)
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

    const handleNavigate = (page) => {
        if (page === "new-study") {
            setShowCreateStudy(true);
            setParticipantLink("");
        }
    };

    const handleStudyChange = (newStudyId) => {
        setStudyId(newStudyId);
        setAnalytics(null);
        setParticipantLink("");
        setLoading(true);
    };

    const footer = (
        <Footer
            onCreateStudy={() => setShowCreateStudy(true)}
            onLogout={handleLogout}
        />
    );

    // ---------- Logged-out screens ----------

    if (!isLoggedIn) {
        if (authPage === "home") {
            return (
                <Home
                    onLogin={() => setAuthPage("login")}
                    onCreateAccount={() => setAuthPage("create-account")}
                />
            );
        }

        if (authPage === "create-account") {
            return (
                <CreateAccount
                    onLoginPage={() => setAuthPage("login")}
                    onAccountCreated={() => {
                        setAuthPage("login");
                        handleLogin();
                    }}
                />
            );
        }

        return (
            <div className="app-shell">
                <Login
                    onLogin={handleLogin}
                    onCreateAccount={() => setAuthPage("create-account")}
                />
            </div>
        );
    }

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (error && !analytics && studies.length > 0) {
        return (
            <div className="error">
                <p>{error}</p>
                <button
                    onClick={() => {
                        setError("");
                        setLoading(true);
                        setStudyId((current) => current);
                    }}
                >
                    Try again
                </button>
                <button onClick={handleLogout}>Log Out</button>
            </div>
        );
    }

    // ---------- Welcome screen (no study loaded yet) ----------

    if (!analytics) {
        return (
            <div className="dashboard">
                <Navbar
                    page="dashboard"
                    onLogout={handleLogout}
                    studies={studies}
                    studyId={studyId}
                    onStudyChange={handleStudyChange}
                    onNavigate={handleNavigate}
                />

                <main className="welcome">
                    {/* Export these from Figma as SVGs into /public/flowers/ */}
                    <img className="flower flower-teal" src="/flowers/teal.svg" alt="" aria-hidden="true" />
                    <img className="flower flower-sand" src="/flowers/sand.svg" alt="" aria-hidden="true" />
                    <img className="flower flower-mint" src="/flowers/mint.svg" alt="" aria-hidden="true" />
                    <img className="flower flower-coral" src="/flowers/coral.svg" alt="" aria-hidden="true" />

                    <div className="welcome-content">
                        <h1>
                            Welcome{userName ? `, ${userName}` : ""}!
                        </h1>
                        <p>
                            {studies.length === 0
                                ? "Every great insight starts with a question. Create your first usability study to start discovering how people experience your website."
                                : "Select a study from the menu above, or create a new one to start collecting participant feedback."}
                        </p>
                        <button
                            className="primary-pill"
                            onClick={() => setShowCreateStudy(true)}
                        >
                            Create New Study
                        </button>
                    </div>
                </main>

                {createStudyModal}
                {footer}
            </div>
        );
    }

    // ---------- Dashboard ----------

    const currentStudy = studies.find((study) => study.id === studyId);

    const studyName =
        analytics.study?.name || currentStudy?.name || "Usability Study";

    const studyDescription =
        analytics.study?.description || currentStudy?.description || "";

    const targetUrl =
        analytics.study?.targetUrl ||
        analytics.study?.target_url ||
        currentStudy?.target_url ||
        "";

    const taskResults = analytics.taskResults || [];
    const feedbackSummary = analytics.feedbackSummary || {};
    const feedbackComments = analytics.feedbackComments || [];
    const mostClickedElements = analytics.mostClickedElements || [];
    const eventActivity = analytics.eventActivity || [];
    const scrollDepth = analytics.scrollDepth || [];
    const heatmapData = analytics.heatmapData || [];

    return (
        <div className="dashboard">
            <Navbar
                page="dashboard"
                onLogout={handleLogout}
                studies={studies}
                studyId={studyId}
                onStudyChange={handleStudyChange}
                onNavigate={handleNavigate}
            />

            <main className="dashboard-content">
                {/* Page heading */}
                <section className="page-header">
                    <div className="page-header-text">
                        <h1>{studyName}</h1>

                        {targetUrl && (
                            <div className="website-badge">
                                <span>Target Website:</span>
                                <a href={targetUrl} target="_blank" rel="noreferrer">
                                    {targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                </a>
                            </div>
                        )}

                        <p className="study-description">
                            {studyDescription || PLACEHOLDER_DESCRIPTION}
                        </p>

                        <button
                            className="primary-pill"
                            onClick={generateParticipantLink}
                            disabled={generatingLink || !studyId}
                        >
                            {generatingLink ? "Generating..." : "Share Unique Participant Link"}
                        </button>

                        {participantLink && (
                            <div className="link-box">
                                <input
                                    aria-label="Participant link"
                                    value={participantLink}
                                    readOnly
                                />
                                <button onClick={copyParticipantLink}>Copy</button>
                            </div>
                        )}
                    </div>

                    {analytics.screenshotUrl && (
                        <div className="header-screenshot">
                            <img
                                src={`${API_URL}${analytics.screenshotUrl}`}
                                alt="Screenshot of the tested website"
                            />
                            <span className="selection-handle top-left"></span>
                            <span className="selection-handle top-right"></span>
                            <span className="selection-handle bottom-left"></span>
                            <span className="selection-handle bottom-right"></span>
                            <span className="screenshot-study-label">{studyName}</span>
                        </div>
                    )}
                </section>

                {error && !showCreateStudy && (
                    <div className="inline-error" role="alert">
                        {error}
                        <button onClick={() => setError("")}>Dismiss</button>
                    </div>
                )}

                {/* Study stats + task results, side by side */}
                <div className="stats-row">
                    <section className="panel panel-filled stats-panel">
                        <h2>Study Stats</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <p>{analytics.participants ?? 0}</p>
                                <h3>participants</h3>
                            </div>
                            <div className="stat-card">
                                <p>{analytics.totalEvents ?? 0}</p>
                                <h3>total events</h3>
                            </div>
                            <div className="stat-card">
                                <p>{analytics.pageViews ?? 0}</p>
                                <h3>page views</h3>
                            </div>
                            <div className="stat-card">
                                <p>{analytics.clicks ?? 0}</p>
                                <h3>clicks</h3>
                            </div>
                        </div>
                    </section>

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
                </div>

                {/* Event activity */}
                <section className="panel panel-outlined">
                    <h2>Event Activity</h2>

                    {eventActivity.length === 0 ? (
                        <p className="empty-state">
                            Interaction data will appear here as participants use the website.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={eventActivity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="minute" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" name="Interactions" radius={[4, 4, 0, 0]}>
                                    {eventActivity.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={index % 2 === 0 ? "#b4dacd" : "#4a9488"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </section>

                {/* Participant feedback */}
                <section className="panel panel-filled">
                    <h2>Participant Feedback</h2>

                    <div className="feedback-summary">
                        <div className="feedback-stat">
                            <strong>{feedbackSummary.responses ?? 0}</strong>
                            <span>responses</span>
                        </div>
                        <div className="feedback-stat">
                            <strong>
                                {feedbackSummary.averageEaseOfUse ?? "—"}
                                {feedbackSummary.averageEaseOfUse != null ? "/5" : ""}
                            </strong>
                            <span>website ease</span>
                        </div>
                        <div className="feedback-stat">
                            <strong>
                                {feedbackSummary.averageTaskEase ?? "—"}
                                {feedbackSummary.averageTaskEase != null ? "/5" : ""}
                            </strong>
                            <span>task ease</span>
                        </div>
                    </div>

                    <div className="feedback-comments">
                        <h3>Participant Comments</h3>

                        {feedbackComments.length === 0 ? (
                            <p className="empty-state">No written feedback yet.</p>
                        ) : (
                            feedbackComments.map((feedback, index) => {
                                const date = formatCommentDate(
                                    feedback.createdAt || feedback.created_at
                                );

                                return (
                                    <article className="feedback-comment" key={index}>
                                        {date && <span className="comment-date">{date}</span>}

                                        <p>
                                            <span>Website Ease: </span>
                                            <em>{feedback.easeOfUse ?? "—"}/5</em>
                                        </p>
                                        <p>
                                            <span>Task Ease: </span>
                                            <em>{feedback.taskEase ?? "—"}/5</em>
                                        </p>

                                        {feedback.confusing && (
                                            <p>
                                                <span>Difficulties: </span>
                                                <em>{feedback.confusing}</em>
                                            </p>
                                        )}

                                        {feedback.additionalFeedback && (
                                            <p>
                                                <span>Additional Feedback: </span>
                                                <em>{feedback.additionalFeedback}</em>
                                            </p>
                                        )}
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Most clicked elements (not in the new mockup — remove if you cut it) */}
                {mostClickedElements.length > 0 && (
                    <section className="panel panel-outlined">
                        <h2>Most Clicked Elements</h2>
                        <p className="card-description">
                            Elements participants interacted with most often
                        </p>

                        <div className="clicked-elements">
                            {mostClickedElements.slice(0, 5).map((item, index) => (
                                <div
                                    className="clicked-element-row"
                                    key={`${item.element}-${index}`}
                                >
                                    <div className="element-info">
                                        <span className="element-rank">{index + 1}</span>
                                        <span className="element-name">{item.element}</span>
                                    </div>
                                    <strong>{item.clicks}</strong>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Scroll depth */}
                <section className="panel panel-outlined">
                    <h2>Scroll Depth</h2>
                    <p className="card-description">
                        How far participants scrolled on the landing page of your site.
                    </p>

                    {scrollDepth.length === 0 ? (
                        <p className="empty-state">No scroll data available yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={scrollDepth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="depth"
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                    formatter={(value) => [value, "Participants"]}
                                    labelFormatter={(value) => `${value}% scroll depth`}
                                />
                                <Bar
                                    dataKey="participants"
                                    name="Participants"
                                    fill="#0f9484"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </section>

                {/* Click heatmap */}
                <section className="panel panel-filled">
                    <h2>Website Heatmap</h2>
                    <p className="card-description">
                        This heatmap shows exactly where participants clicked on your site.
                    </p>

                    {!analytics.screenshotUrl ? (
                        <div className="heatmap heatmap-empty">
                            <p className="empty-state">
                                A website screenshot will appear here when available.
                            </p>
                        </div>
                    ) : (
                        <div className="heatmap">
                            <img
                                src={`${API_URL}${analytics.screenshotUrl}`}
                                alt="Screenshot of the tested website"
                                className="heatmap-background"
                            />

                            <div className="heatmap-overlay">
                                {heatmapData.map((point, index) => {
                                    const pageWidth = point.pageWidth || 1440;
                                    const pageHeight = point.pageHeight || 900;
                                    const x = (point.x / pageWidth) * 100;
                                    const y = (point.y / pageHeight) * 100;

                                    return (
                                        <div
                                            key={index}
                                            className="click-point"
                                            style={{ left: `${x}%`, top: `${y}%` }}
                                            title={`Click ${index + 1}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {createStudyModal}
            {footer}
        </div>
    );
}

export default App;