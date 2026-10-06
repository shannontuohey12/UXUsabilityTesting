import { useEffect, useState } from "react";
import Login from "./Login";

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

function App() {
    const token = localStorage.getItem("sessionToken");
    const [isLoggedIn, setIsLoggedIn] = useState(Boolean(token));
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [studyId, setStudyId] = useState(2);
    const [studies, setStudies] = useState([]);
    const [showCreateStudy, setShowCreateStudy] = useState(false);
    const [newStudyName, setNewStudyName] = useState("");
    const [newStudyUrl, setNewStudyUrl] = useState("");
    const [participantLink, setParticipantLink] = useState("");
    const [creatingStudy, setCreatingStudy] = useState(false);

    const createStudy = async (event) => {
        event.preventDefault();

        if (!newStudyName || !newStudyUrl) {
            return;
        }

        setCreatingStudy(true);
        setParticipantLink("");

        try {
            const response = await fetch(
                "http://localhost:3000/api/studies",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: newStudyName,
                        targetUrl: newStudyUrl
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create study");
            }

            const data = await response.json();
            localStorage.setItem("sessionToken", data.sessionToken);
            console.log("Study created:", data);

            const newStudy = data.study;

            // Add new study to dropdown
            setStudies((currentStudies) => [
                ...currentStudies,
                {
                    id: newStudy.id,
                    name: newStudy.name,
                    target_url: newStudy.targetUrl
                }
            ]);

        
            // Select the new study
            setStudyId(newStudy.id);

            // Reset form
            setNewStudyName("");
            setNewStudyUrl("");

        } catch (error) {
            console.error(error);
            setError("Could not create study.");
        } finally {
            setCreatingStudy(false);
        }
    };

const generateParticipantLink = async () => {
    setParticipantLink("");

    try {
        const response = await fetch(
            `http://localhost:3000/api/studies/${studyId}/participant-links`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to generate participant link");
        }

        const data = await response.json();
        localStorage.setItem("sessionToken", data.sessionToken);

        console.log("Participant link:", data.participantLink);

        setParticipantLink(data.participantLink);

    } catch (error) {
        console.error(error);
        setError("Could not generate participant link.");
    }
};
    
    useEffect(() => {

        fetch("http://localhost:3000/api/studies", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch studies");
            }

            return response.json();
        })
        .then((data) => {
            setStudies(data);
        })
        .catch((error) => {
            console.error(error);
            setError("Could not load studies.");
        });
}, []);


    useEffect(() => {
    if (!isLoggedIn) return;

        fetch(
            `http://localhost:3000/api/studies/${studyId}/analytics`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch analytics");
                }

                return response.json();
            })
            .then((data) => {
                setAnalytics(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError("Could not load study analytics.");
                setLoading(false);
            });
    }, [studyId, isLoggedIn]);

    if (!isLoggedIn) {
    return (
        <Login
            onLogin={() => setIsLoggedIn(true)}
        />
    );
}

    if (loading) {
        return (
            <div className="loading">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                {error}
            </div>
        );
    }

    return (
        <div className="dashboard">

            {/* HEADER */}

            <header className="dashboard-header">

                <div>
                    <h1>UX Research Dashboard</h1>
                    <p>{analytics.study.name}</p>
                </div>

                <div className="study-controls">

                    <select
                        value={studyId}
                        onChange={(event) => {
                            setStudyId(Number(event.target.value));
                            setAnalytics(null);
                            setLoading(true);
                        }}
                    >
                        {studies.map((study) => (
                            <option
                                key={study.id}
                                value={study.id}
                            >
                                {study.name}
                            </option>
                        ))}
                    </select>

                    <button
                        className="participant-link-button"
                        onClick={generateParticipantLink}
                    >
                        Generate Unique Participant Link
                    </button>

                    <button
                        className="create-study-button"
                        onClick={() => {
                            setShowCreateStudy(true);
                            setParticipantLink("");
                        }}
                    >
                        + New Study
                    </button>

                </div>

                {showCreateStudy && (
                    <div className="create-study-card">

                        <div className="create-study-header">
                            <div>
                                <h2>Create New Study</h2>
                                <p>
                                    Enter the website you want participants to test.
                                </p>
                            </div>

                            <button
                                className="close-button"
                                onClick={() => setShowCreateStudy(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={createStudy}>

                            <label>
                                Study Name
                            </label>

                            <input
                                type="text"
                                placeholder="Portfolio Usability Test"
                                value={newStudyName}
                                onChange={(event) =>
                                    setNewStudyName(event.target.value)
                                }
                            />

                            <label>
                                Website URL
                            </label>

                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={newStudyUrl}
                                onChange={(event) =>
                                    setNewStudyUrl(event.target.value)
                                }
                                required
                            />

                            <button
                                type="submit"
                                className="create-study-submit"
                                disabled={creatingStudy}
                            >
                                {creatingStudy
                                    ? "Creating..."
                                    : "Create Study"}
                            </button>

                        </form>

                             
                                
                     </div>

                        )}

    {participantLink && (
        <div className="participant-link-card">

            <h3>🔗 Participant Link</h3>

            <p>
                Send this link to a participant for this study:
            </p>

            <div className="link-box">

                <input
                    type="text"
                    value={participantLink}
                    readOnly
                />

                <button
                    onClick={() =>
                        navigator.clipboard.writeText(
                            participantLink
                        )
                    }
                >
                    Copy
                </button>

            </div>

        </div>
    )}

                    

            </header>


            <main>

                {/* STAT CARDS */}

                <section className="stats-grid">

                    <div className="stat-card">
                        <h3>Participants</h3>
                        <p>{analytics.participants}</p>
                    </div>

                    <div className="stat-card">
                        <h3>Total Events</h3>
                        <p>{analytics.totalEvents}</p>
                    </div>

                    <div className="stat-card">
                        <h3>Page Views</h3>
                        <p>{analytics.pageViews}</p>
                    </div>

                    <div className="stat-card">
                        <h3>Clicks</h3>
                        <p>{analytics.clicks}</p>
                    </div>

                </section>


                {/* 
                    EVENT ACTIVITY
                 */}

                <section className="chart-card">

                    <div className="chart-header">

                        <div>
                            <h2>Event Activity</h2>
                            <p>
                                Participant interactions over time
                            </p>
                        </div>

                    </div>

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >
                        <LineChart
                            data={analytics.eventActivity}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="minute"
                            />

                            <YAxis
                                allowDecimals={false}
                            />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                            />

                        </LineChart>
                    </ResponsiveContainer>

                </section>


                {/* 
                    EVENT BREAKDOWN + WEBSITE
                 */}

                <section className="analytics-grid">

                    <div className="analytics-card">

                        <h2>Event Breakdown</h2>

                        <div className="event-row">
                            <span>Clicks</span>
                            <strong>
                                {analytics.clicks}
                            </strong>
                        </div>

                        <div className="event-row">
                            <span>Page Views</span>
                            <strong>
                                {analytics.pageViews}
                            </strong>
                        </div>

                        <div className="event-row">
                            <span>Scroll Events</span>
                            <strong>
                                {analytics.scrolls}
                            </strong>
                        </div>

                    </div>


                    <div className="analytics-card">

                        <h2>Study Website</h2>

                        <p className="website-url">
                            {analytics.study.targetUrl}
                        </p>

                    </div>

                </section>

                { /*
                    TASK RESULTS
                 */}
                <section className="analytics-card">

                    <h2>Task Results</h2>

                    <p className="card-description">
                        How participants performed on each task
                    </p>

                    <div className="task-results">

                        {analytics.taskResults.length === 0 ? (

                            <p>
                                No task results available yet.
                            </p>

                        ) : (

                            analytics.taskResults.map((task) => {

                                const total =
                                    task.completed + task.skipped;

                                const completionRate =
                                    total > 0
                                        ? Math.round(
                                            (task.completed / total) * 100
                                        )
                                        : 0;

                                return (
                                    <div
                                        className="task-result-row"
                                        key={task.taskId}
                                    >

                                        <div className="task-info">

                                            <strong>
                                                Task {task.taskId}
                                            </strong>

                                            <span>
                                                {task.taskTitle}
                                            </span>

                                        </div>

                                        <div className="task-stats">

                                            <span className="completed">
                                                ✓ {task.completed} completed
                                            </span>

                                            <span className="skipped">
                                                {task.skipped} skipped
                                            </span>

                                            <strong>
                                                {completionRate}%
                                            </strong>

                                        </div>

                                    </div>
                                );
                            })

                        )}

                    </div>

                </section>

                {/* 
                    PARTICIPANT FEEDBACK 
                */}

                <section className="analytics-card">

                    <h2>Participant Feedback</h2>

                    <p className="card-description">
                        Feedback collected after the usability test
                    </p>

                    <div className="feedback-summary">

                        <div className="feedback-stat">
                            <span>Responses</span>
                            <strong>
                                {analytics.feedbackSummary.responses}
                            </strong>
                        </div>

                        <div className="feedback-stat">
                            <span>Website Ease</span>
                            <strong>
                                {analytics.feedbackSummary.averageEaseOfUse || "—"}
                                / 5
                            </strong>
                        </div>

                        <div className="feedback-stat">
                            <span>Task Ease</span>
                            <strong>
                                {analytics.feedbackSummary.averageTaskEase || "—"}
                                / 5
                            </strong>
                        </div>

                    </div>


                    <div className="feedback-comments">

                        <h3>Participant Comments</h3>

                        {analytics.feedbackComments.length === 0 ? (

                            <p>
                                No written feedback yet.
                            </p>

                        ) : (

                            analytics.feedbackComments.map(
                                (feedback, index) => (

                                    <div
                                        className="feedback-comment"
                                        key={index}
                                    >

                                        <div className="feedback-ratings">

                                            <span>
                                                Website: {feedback.easeOfUse}/5
                                            </span>

                                            <span>
                                                Tasks: {feedback.taskEase}/5
                                            </span>

                                        </div>

                                        {feedback.confusing && (
                                            <p>
                                                <strong>
                                                    Difficulties:
                                                </strong>{" "}
                                                {feedback.confusing}
                                            </p>
                                        )}

                                        {feedback.additionalFeedback && (
                                            <p>
                                                <strong>
                                                    Additional feedback:
                                                </strong>{" "}
                                                {feedback.additionalFeedback}
                                            </p>
                                        )}

                                    </div>

                                )
                            )

                        )}

                    </div>

                </section>
                {/* 
                    MOST CLICKED ELEMENTS
                 */}

                <section className="analytics-card most-clicked-card">

                    <h2>Most Clicked Elements</h2>

                    <p className="card-description">
                        Elements participants interacted with most often
                    </p>

                    <div className="clicked-elements">

                        {analytics.mostClickedElements.length === 0 ? (

                            <p>
                                No click data available yet.
                            </p>

                        ) : (

                            analytics.mostClickedElements
                                .slice(0, 5)
                                .map((item, index) => (

                                    <div
                                        className="clicked-element-row"
                                        key={item.element}
                                    >

                                        <div className="element-info">

                                            <span className="element-rank">
                                                {index + 1}
                                            </span>

                                            <span className="element-name">
                                                {item.element}
                                            </span>

                                        </div>

                                        <strong>
                                            {item.clicks}
                                        </strong>

                                    </div>

                                ))

                        )}

                    </div>

                </section>


                {/* 
                    SCROLL DEPTH
                 */}

                <section className="chart-card">

                    <div className="chart-header">

                        <div>
                            <h2>Scroll Depth</h2>

                            <p>
                                How far participants scrolled on the website
                            </p>
                        </div>

                    </div>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <BarChart
                            data={analytics.scrollDepth}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="depth"
                                tickFormatter={(value) =>
                                    `${value}%`
                                }
                            />

                            <YAxis
                                allowDecimals={false}
                            />

                            <Tooltip
                                formatter={(value) => [
                                    value,
                                    "Participants"
                                ]}
                                labelFormatter={(value) =>
                                    `${value}% scroll depth`
                                }
                            />

                            <Bar
                                dataKey="participants"
                                fill="#6366f1"
                                radius={[6, 6, 0, 0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </section>


                {/* 
                    CLICK HEATMAP
                 */}

                <section className="chart-card">

                    <div className="chart-header">

                        <div>
                            <h2>Click Heatmap</h2>

                            <p>
                                Where participants clicked on the website
                            </p>
                        </div>

                    </div>


                    <div className="heatmap">
                        <img
                            src={`http://localhost:3000${analytics.screenshotUrl}`}
                            alt="Website screenshot"
                            className="heatmap-background"
                        />

                        <div className="heatmap-overlay">
                            {analytics.heatmapData.map(
                                (point, index) => {
                                    const pageWidth =
                                        point.pageWidth || 1440;

                                    const pageHeight =
                                        point.pageHeight || 900;

                                    const xPercent =
                                        (point.x / pageWidth) * 100;

                                    const yPercent =
                                        (point.y / pageHeight) * 100;

                                    return (
                                        <div
                                            key={index}
                                            className="click-point"
                                            style={{
                                                left: `${xPercent}%`,
                                                top: `${yPercent}%`
                                            }}
                                        />
                                    );
                                }
                            )}
                        </div>
                    </div>
                </section>

            </main>

        </div>
    );
}

export default App;