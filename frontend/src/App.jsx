
import { useEffect, useState } from "react";
import Login from "./Login";
import Navbar from "./Navbar"
import CreateAccount from "./CreateAccount";
import Home from "./Home";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import "./App.css";

const API_URL = "http://localhost:3000";

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
        { title: "", instructions: ""}
    ]);

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
                const response = await fetch(
                    `${API_URL}/api/studies`,
                    { headers: getAuthHeaders() }
                );

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
                i === index
                    ? { ...task, [field]: value }
                    : task
            )
        );
    };

    const removeStudyTask = (index) => {
        setNewStudyTasks((current) =>
            current.filter((_, i) => i !== index)
        );
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
            (task) =>
                !task.title.trim() ||
                !task.instructions.trim()
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
                <div className="app-shell">
                    <Navbar
                        page="create-account"
                        onNavigate={(page) => setAuthPage(page)}
                    />
                    <CreateAccount
                        onLoginPage={() => setAuthPage("login")}
                        onAccountCreated={() => {
                            setAuthPage("login");
                            handleLogin();
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="app-shell">
                <Navbar
                    page="login"
                    onNavigate={(page) => setAuthPage(page)}
                />
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

    if (error && !analytics) {
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

    if (!analytics) {
        return (
            <div className="dashboard">
                <Navbar
                    page="dashboard"
                    onLogout={handleLogout}
                    studies={studies}
                    studyId={studyId}
                    onStudyChange={(newStudyId) => {
                        setStudyId(newStudyId);
                        setAnalytics(null);
                        setLoading(true);
                    }}
                />

                <main className="dashboard-content">
                    <h1>Welcome to Rooted Insights</h1>
                    <p>Create a study to start collecting usability insights.</p>
                    {studies.length === 0 && (
                        <button
                            className="create-study-button"
                            onClick={() => setShowCreateStudy(true)}
                        >
                            Create Your First Study
                        </button>
                    )}
                </main>

                {showCreateStudy && (
                    <section className="create-study-card">
                        <div className="create-study-header">
                            <div>
                                <h2>Create New Study</h2>
                                <p>Enter the website you want participants to test.</p>
                            </div>
                            <button
                                className="close-button"
                                onClick={() => setShowCreateStudy(false)}
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </div>

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
                                            placeholder="e.g. Find the contact page"
                                            required
                                        />

                                        <label htmlFor={`task-instructions-${index}`}>
                                            Instructions
                                        </label>

                                        <textarea
                                            id={`task-instructions-${index}`}
                                            value={task.instructions}
                                            onChange={(event) =>
                                                updateStudyTask(index, "instructions", event.target.value)
                                            }
                                            placeholder="Describe what the participant should try to do..."
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
                )}

            </div>
        );
    }

    const studyName =
        analytics.study?.name ||
        studies.find((study) => study.id === studyId)?.name ||
        "Usability Study";

    const targetUrl =
        analytics.study?.targetUrl ||
        analytics.study?.target_url ||
        studies.find((study) => study.id === studyId)?.target_url ||
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
                onStudyChange={(newStudyId) => {
                    setStudyId(newStudyId);
                    setAnalytics(null);
                    setParticipantLink("");
                }}
                onNavigate={(page) => {
                    if (page === "new-study") {
                        setShowCreateStudy(true);
                        setParticipantLink("");
                    }
                }}
            />

            <main className="dashboard-content">
                {/* Page heading */}
                <section className="page-header">
                    <h1>UX Research Dashboard</h1>
                    <p className="study-subtitle">{studyName}</p>

                    {targetUrl && (
                        <div className="website-badge">
                            <span>Target Website:</span>
                            <a href={targetUrl} target="_blank" rel="noreferrer">
                                {targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            </a>
                        </div>
                    )}
                </section>

                {error && (
                    <div className="inline-error" role="alert">
                        {error}
                        <button onClick={() => setError("")}>Dismiss</button>
                    </div>
                )}

                {/* Create study form */}
                {showCreateStudy && (
                    <section className="create-study-card">
                        <div className="create-study-header">
                            <div>
                                <h2>Create New Study</h2>
                                <p>Enter the website you want participants to test.</p>
                            </div>
                            <button
                                className="close-button"
                                onClick={() => setShowCreateStudy(false)}
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </div>

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
                                            placeholder="e.g. Find the contact page"
                                            required
                                        />

                                        <label htmlFor={`task-instructions-${index}`}>
                                            Instructions
                                        </label>

                                        <textarea
                                            id={`task-instructions-${index}`}
                                            value={task.instructions}
                                            onChange={(event) =>
                                                updateStudyTask(index, "instructions", event.target.value)
                                            }
                                            placeholder="Describe what the participant should try to do..."
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
                )}

                {/* Participant link controls */}
                <section className="participant-link-card">
                    <div>
                        <h3>Participant Link</h3>
                        <p>Generate a unique link to share with a study participant.</p>
                    </div>

                    <button
                        onClick={generateParticipantLink}
                        disabled={generatingLink || !studyId}
                    >
                        {generatingLink ? "Generating..." : "Generate Link"}
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
                </section>

                {/* Summary metrics */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <h3>Participants</h3>
                        <p>{analytics.participants ?? 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Events</h3>
                        <p>{analytics.totalEvents ?? 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Page Views</h3>
                        <p>{analytics.pageViews ?? 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Clicks</h3>
                        <p>{analytics.clicks ?? 0}</p>
                    </div>
                </section>

                {/* Event activity chart */}
                <section className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2>Event Activity</h2>
                            <p>Participant interactions over time</p>
                        </div>
                    </div>

                    {eventActivity.length === 0 ? (
                        <p className="empty-state">
                            Interaction data will appear here as participants use the website.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={eventActivity}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="minute" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    name="Interactions"
                                    stroke="#258f85"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#258f85" }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </section>

                {/* Task results */}
                <section className="analytics-card">
                    <h2>Task Results</h2>
                    <p className="card-description">
                        How participants performed on each task
                    </p>

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

                                return (
                                    <div
                                        className="task-result-row"
                                        key={task.taskId}
                                    >
                                        <div className="task-info">
                                            <strong>Task {task.taskId}</strong>
                                            <span>{task.taskTitle}</span>
                                        </div>
                                        <div className="task-stats">
                                            <span className="completed">
                                                ✓ {completed} Completed
                                            </span>
                                            <span className="skipped">
                                                {skipped} Skipped
                                            </span>
                                            <strong>{rate}%</strong>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Participant feedback */}
                <section className="analytics-card">
                    <h2>Participant Feedback</h2>
                    <p className="card-description">
                        Feedback collected after the usability test
                    </p>

                    <div className="feedback-summary">
                        <div className="feedback-stat">
                            <span>Responses</span>
                            <strong>{feedbackSummary.responses ?? 0}</strong>
                        </div>
                        <div className="feedback-stat">
                            <span>Website Ease</span>
                            <strong>
                                {feedbackSummary.averageEaseOfUse ?? "—"}
                                {feedbackSummary.averageEaseOfUse != null ? "/5" : ""}
                            </strong>
                        </div>
                        <div className="feedback-stat">
                            <span>Task Ease</span>
                            <strong>
                                {feedbackSummary.averageTaskEase ?? "—"}
                                {feedbackSummary.averageTaskEase != null ? "/5" : ""}
                            </strong>
                        </div>
                    </div>

                    <div className="feedback-comments">
                        <h3>Participant Comments</h3>

                        {feedbackComments.length === 0 ? (
                            <p className="empty-state">No written feedback yet.</p>
                        ) : (
                            feedbackComments.map((feedback, index) => (
                                <article className="feedback-comment" key={index}>
                                    <div className="feedback-ratings">
                                        <span>Website: {feedback.easeOfUse ?? "—"}/5</span>
                                        <span>Tasks: {feedback.taskEase ?? "—"}/5</span>
                                    </div>

                                    {feedback.confusing && (
                                        <p>
                                            <strong>Difficulties: </strong>
                                            {feedback.confusing}
                                        </p>
                                    )}

                                    {feedback.additionalFeedback && (
                                        <p>
                                            <strong>Additional feedback: </strong>
                                            {feedback.additionalFeedback}
                                        </p>
                                    )}
                                </article>
                            ))
                        )}
                    </div>
                </section>

                {/* Most clicked elements */}
                <section className="analytics-card">
                    <h2>Most Clicked Elements</h2>
                    <p className="card-description">
                        Elements participants interacted with most often
                    </p>

                    {mostClickedElements.length === 0 ? (
                        <p className="empty-state">No click data available yet.</p>
                    ) : (
                        <div className="clicked-elements">
                            {mostClickedElements.slice(0, 5).map((item, index) => (
                                <div
                                    className="clicked-element-row"
                                    key={`${item.element}-${index}`}
                                >
                                    <div className="element-info">
                                        <span className="element-rank">
                                            {index + 1}
                                        </span>
                                        <span className="element-name">
                                            {item.element}
                                        </span>
                                    </div>
                                    <strong>{item.clicks}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Scroll depth */}
                <section className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2>Scroll Depth</h2>
                            <p>How far participants scrolled on the website</p>
                        </div>
                    </div>

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
                                    fill="#258f85"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </section>

                {/* Click heatmap */}
                <section className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2>Click Heatmap</h2>
                            <p>Where participants clicked on the website</p>
                        </div>
                    </div>

                    {!analytics.screenshotUrl ? (
                        <p className="empty-state">
                            A website screenshot will appear here when available.
                        </p>
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
                                            style={{
                                                left: `${x}%`,
                                                top: `${y}%`
                                            }}
                                            title={`Click ${index + 1}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
