import "./Home.css";
import { useRef } from "react"; // for tilting

const faqs = [
    {
        question: "What is Rooted Insights?",
        answer:
            "Rooted Insights is a UX research and usability testing platform that helps you understand how people interact with your website. Create studies, collect participant interactions, and explore insights that can help improve your design."
    },
    {
        question: "How do I create a study?",
        answer:
            "Create a new study by entering your website URL and adding tasks for participants to complete. Rooted Insights generates a unique link that you can share with participants."
    },
    {
        question: "Do I need coding experience to use Rooted Insights?",
        answer:
            "No! Rooted Insights is designed to make usability testing accessible. You can create studies and review participant interactions without needing to write code."
    },
    {
        question: "Is there any payment necessary for Rooted Insights?",
        answer:
            "Rooted Insights is designed to make UX research more accessible. Contact us if you have questions about platform availability."
    },
    {
        question: "Can I run multiple usability studies on one account?",
        answer:
            "Yes! You can create and manage multiple studies from your researcher dashboard."
    }
];

const steps = [
    {
        number: "1",
        title: "Create a Study",
        description:
            "Add the link to your existing live website, and share any tasks you want users to complete."
    },
    {
        number: "2",
        title: "Invite Participants",
        description:
            "Share a unique study link with each participant. These could be your friends, family, or colleagues."
    },
    {
        number: "3",
        title: "Collect Interactions",
        description:
            "Track website activity and gather participant feedback from each user."
    },
    {
        number: "4",
        title: "Explore Results",
        description:
            "Analyze heatmaps, task performance, and user behavior."
    }
];

const chartBars = [35, 52, 43, 72, 48, 62, 40, 83, 57, 70, 47, 91, 65, 76];

export default function Home({ onLogin, onCreateAccount }) {
    
    const dashboardRef = useRef(null);

    const handleChartMouseMove = (e) => {
        const card = dashboardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();

        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 10;
        const rotateX = (0.5 - y) * 10;

        card.style.transform = `
            perspective(1200px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(1.02, 1.02, 1.02)
        `;
    };

    const handleChartMouseLeave = () => {
        if (!dashboardRef.current) return;

        dashboardRef.current.style.transform =
            "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    };
        
        
    return (
        <div className="home-page" id="top">
            {/* NAVIGATION */}
            <nav className="home-navbar">
                <a className="home-brand" href="/" aria-label="Rooted Insights home">
                    <img src="/RootedInsights.svg" alt="Rooted Insights" />
                </a>

                <div className="home-nav-links">
                    <a href="#about">About</a>
                    <a href="#faq">FAQ</a>
                    <a href="#how-it-works">How It Works</a>
                </div>

                <div className="home-nav-actions">
                    <button className="home-login-link" onClick={onLogin}>
                        Log In
                    </button>
                    <button className="home-nav-cta" onClick={onCreateAccount}>
                        Create Account
                    </button>
                </div>
            </nav>

            <main>
                {/* HERO */}
                <section className="home-hero">
                    <div className="hero-copy">
                        <span className="hero-eyebrow">
                            UX RESEARCH & USABILITY TESTING
                        </span>

                        <div className="hero-heading-frame">
                            <h1>
                                Better websites
                                <br />
                                start with
                                <br />
                                <span>understanding</span>
                                <br />
                                your users.
                            </h1>

                            <span className="selection-handle handle-top-left" />
                            <span className="selection-handle handle-top-right" />
                            <span className="selection-handle handle-bottom-left" />
                            <span className="selection-handle handle-bottom-right" />
                        </div>

                        <div className="hero-design-label">
                            user <span>×</span> designer
                        </div>

                        <p>
                            Discover how people interact with your website,
                            identify usability challenges, and turn real
                            interactions into meaningful design improvements.
                        </p>

                        <div className="hero-actions">
                            <button
                                className="hero-primary-button"
                                onClick={onCreateAccount}
                            >
                                Get Started <span aria-hidden="true">→</span>
                            </button>

                            <button
                                className="hero-secondary-button"
                                onClick={onLogin}
                            >
                                Log In
                            </button>
                        </div>
                    </div>

                    {/* DASHBOARD PREVIEW */}
                    <div
                        className="dashboard-preview"
                        ref={dashboardRef}
                        onMouseMove={handleChartMouseMove}
                        onMouseLeave={handleChartMouseLeave}
                        aria-label="Illustrative analytics dashboard preview"
                    >
                        <div className="preview-topbar">
                            <div>
                                <span className="preview-label">YOUR WORKSPACE</span>
                                <h2>Study overview</h2>
                            </div>

                            <span className="preview-status">
                                <span className="status-dot" />
                                Sample data
                            </span>
                        </div>

                        <div className="preview-stats">
                            <div className="preview-stat">
                                <span>Participants</span>
                                <strong>24</strong>
                                <small>Study visitors</small>
                            </div>

                            <div className="preview-stat">
                                <span>Interactions</span>
                                <strong>1,286</strong>
                                <small>Tracked events</small>
                            </div>

                            <div className="preview-stat">
                                <span>Page views</span>
                                <strong>186</strong>
                                <small>Pages explored</small>
                            </div>
                        </div>

                        <div className="preview-chart">
                            <div className="preview-chart-heading">
                                <div>
                                    <h3>Interaction activity</h3>
                                    <p>Explore how participants use a website</p>
                                </div>

                                <span className="preview-chart-period">
                                    Last 7 days
                                </span>
                            </div>

                            <div className="preview-bars" aria-hidden="true">
                                {chartBars.map((height, index) => (
                                    <div className="preview-bar-column" key={index}>
                                        <span style={{ height: `${height}%` }} />
                                    </div>
                                ))}
                            </div>

                            <div className="preview-chart-labels">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                                    (day) => (
                                        <span key={day}>{day}</span>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ABOUT */}
                <section className="home-about" id="about">
                    <div className="about-inner">
                        <div className="about-title">
                            <h2>About Rooted Insights</h2>
                        </div>

                        <div className="mission-grid">
                            <article className="mission-card">
                                <h3>Our Mission</h3>
                                <img
                                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85"
                                    alt="A team collaborating around a table"
                                />
                                <p>
                                    Make usability testing more accessible by
                                    giving researchers a simple way to collect
                                    meaningful user insights.
                                </p>
                            </article>

                            <article className="mission-card">
                                <h3>Our Approach</h3>
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=85"
                                    alt="Team members working together"
                                />
                                <p>
                                    Combine real participant interactions,
                                    usability feedback, and visual analytics
                                    to better understand user behavior.
                                </p>
                            </article>

                            <article className="mission-card">
                                <h3>Our Goal</h3>
                                <img
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85"
                                    alt="Researchers discussing ideas together"
                                />
                                <p>
                                    Help create digital experiences that are
                                    thoughtful, intuitive, and centered around
                                    the people who use them.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="home-faq" id="faq">
                    <div className="faq-inner">
                        <div className="faq-heading">
                            <h2>Frequently Asked Questions</h2>
                        </div>

                        <div className="faq-list">
                            {faqs.map((faq, index) => (
                                <details className="faq-item" key={index}>
                                    <summary>
                                        <span>{faq.question}</span>
                                        <span
                                            className="faq-toggle"
                                            aria-hidden="true"
                                        >
                                            +
                                        </span>
                                    </summary>

                                    <p>{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section
                    className="home-how-it-works"
                    id="how-it-works"
                >
                    <div className="how-inner">
                        <div className="how-heading">
                            <h2>How It Works</h2>
                        </div>

                        <div className="steps-grid">
                            <svg
                                className="step-connectors"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                            >
                                <defs>
                                    <marker
                                        id="step-arrow"
                                        markerWidth="5"
                                        markerHeight="5"
                                        refX="4"
                                        refY="2.5"
                                        orient="auto"
                                    >
                                        <path
                                            d="M0,0 L5,2.5 L0,5"
                                            fill="none"
                                            stroke="white"
                                        />
                                    </marker>
                                </defs>

                                <path
                                    d="M42 25 H58"
                                    markerEnd="url(#step-arrow)"
                                />
                                <path
                                    d="M75 42 V50 H25 V58"
                                    markerEnd="url(#step-arrow)"
                                />
                                <path
                                    d="M42 75 H58"
                                    markerEnd="url(#step-arrow)"
                                />
                            </svg>

                            {steps.map((step) => (
                                <article className="step-card" key={step.number}>
                                    <h3>
                                        {step.number}. {step.title}
                                    </h3>
                                    <p>{step.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="home-footer">
                <div className="footer-brand">
                    <img src="/RootedInsights.svg" alt="Rooted Insights" />
                    <p>Grow your design skills and empower users.</p>
                    <a
                        href="#top"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                    >
                        Back to Top ↑
                    </a>
                </div>

                <div className="footer-column">
                    <h3>Navigation</h3>
                    <a href="#about">About</a>
                    <a href="#faq">FAQ</a>
                    <a href="#how-it-works">How It Works</a>
                </div>

                <div className="footer-column">
                    <h3>Have any feedback?</h3>
                    <p>
                        Please email
                        <a href="mailto:shannontuohey12@gmail.com">
                            shannontuohey12@gmail.com
                        </a>
                        if you encounter any issues or want to provide feedback
                        on Rooted Insights.
                    </p>
                </div>

                <div className="footer-bottom">
                    © {new Date().getFullYear()} Rooted Insights
                </div>
            </footer>
        </div>
    );
}