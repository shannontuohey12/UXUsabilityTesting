import { useEffect, useState } from "react";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import CreateAccount from "./components/CreateAccount";
import Home from "./components/Home";
import FeedbackPage from "./components/FeedbackPage";
import Footer from "./components/Footer";
import CreateStudyModal from "./components/CreateStudyModal";
import StudyStats from "./components/StudyStats";
import TaskResults from "./components/TaskResults";
import EventActivity from "./components/EventActivity";
import ScrollDepth from "./components/ScrollDepth";
import ParticipantFeedback from "./components/ParticipantFeedback";
import MostClickedElements from "./components/MostClickedElements";
import WebsiteHeatmap from "./components/WebsiteHeatmap";
import StudyHeader from "./components/StudyHeader";
import "./styles/Dashboard.css";
import "./styles/App.css";



const API_URL = "http://localhost:3000";

const PLACEHOLDER_DESCRIPTION =
    "Welcome to your usability study dashboard! Here you can view analytics about how participants are interacting with your website, including task completion rates, feedback comments, click activity, scroll depth, and heatmaps. Use this information to improve the user experience of your site.";

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

    // Used for "Welcome, [name]!". Save this at login/account creation:
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

    const handleLogout = () => { //clear session token and reset state on logout
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

    // Show the participant feedback page when the URL is /feedback
    if (window.location.pathname === "/feedback") {
        return <FeedbackPage />;
    }

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

   const createStudyModal = (
        <CreateStudyModal
            showCreateStudy={showCreateStudy}
            setShowCreateStudy={setShowCreateStudy}
            error={error}
            newStudyName={newStudyName}
            setNewStudyName={setNewStudyName}
            newStudyUrl={newStudyUrl}
            setNewStudyUrl={setNewStudyUrl}
            newStudyTasks={newStudyTasks}
            updateStudyTask={updateStudyTask}
            moveStudyTask={moveStudyTask}
            removeStudyTask={removeStudyTask}
            addStudyTask={addStudyTask}
            createStudy={createStudy}
            creatingStudy={creatingStudy}
        />
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
                
            <StudyHeader
                studyName={studyName}
                targetUrl={targetUrl}
                studyDescription={studyDescription}
                placeholderDescription={PLACEHOLDER_DESCRIPTION}
                generateParticipantLink={generateParticipantLink}
                generatingLink={generatingLink}
                studyId={studyId}
                participantLink={participantLink}
                copyParticipantLink={copyParticipantLink}
                analytics={analytics}
                apiUrl={API_URL}
            />

                {error && !showCreateStudy && (
                    <div className="inline-error" role="alert">
                        {error}
                        <button onClick={() => setError("")}>Dismiss</button>
                    </div>
                )}

                {/* Study stats + task results, side by side */}
                <div className="stats-row">
                    <StudyStats analytics={analytics} />
                    <TaskResults taskResults={taskResults} />
                </div>

                <EventActivity eventActivity={eventActivity} />

                <ParticipantFeedback 
                    feedbackSummary={feedbackSummary}
                    feedbackComments={feedbackComments}
                />

                <MostClickedElements mostClickedElements={mostClickedElements} />
                
                <ScrollDepth scrollDepth={scrollDepth} />

                <WebsiteHeatmap
                    analytics={analytics}
                    heatmapData={heatmapData}
                    apiUrl={API_URL}
                />
            </main>

            {createStudyModal}
            {footer}
        </div>
    );
}

export default App;