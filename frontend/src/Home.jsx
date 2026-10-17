
import "./Home.css";

export default function Home({ onLogin, onCreateAccount }) {
    return (
        <div className="home-page">
            <nav className="home-navbar">
                <a className="home-brand" href="/" aria-label="Rooted Insights home">
                    <img src="/RootedInsights.svg" alt="Rooted Insights" />
                </a>

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
                <section className="home-hero">
                    <div className="hero-copy">
                        <span className="hero-eyebrow">
                            UX RESEARCH & USABILITY TESTING
                        </span>

                        <h1>
                            Better websites start with
                            <span> understanding your users.</span>
                        </h1>

                        <p>
                            Discover usability issues, understand user behavior,
                            and turn real interactions into meaningful design
                            improvements.
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

                    <div className="dashboard-preview" aria-label="Illustrative analytics dashboard preview">
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
                                <span className="preview-chart-period">Last 7 days</span>
                            </div>

                            <div className="preview-bars" aria-hidden="true">
                                {[35, 52, 43, 72, 48, 62, 40, 83, 57, 70, 47, 91, 65, 76].map(
                                    (height, index) => (
                                        <div className="preview-bar-column" key={index}>
                                            <span style={{ height: `${height}%` }} />
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="preview-chart-labels">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="home-features">
                    <div className="features-heading">
                        <span className="hero-eyebrow">FROM TESTING TO INSIGHT</span>
                        <h2>Put your users at the root of every decision.</h2>
                        <p>
                            Everything you need to understand your website
                            through the people who use it.
                        </p>
                    </div>

                    <div className="feature-grid">
                        <article className="feature-card">
                            <div className="feature-icon">↗</div>
                            <h3>Usability Testing</h3>
                            <p>
                                Create studies and tasks to learn how people
                                navigate your website and complete key actions.
                            </p>
                        </article>

                        <article className="feature-card">
                            <div className="feature-icon">⌁</div>
                            <h3>Interaction Analytics</h3>
                            <p>
                                Explore clicks, scrolling, and participant
                                activity to understand real user behavior.
                            </p>
                        </article>

                        <article className="feature-card">
                            <div className="feature-icon">✳</div>
                            <h3>Actionable Insights</h3>
                            <p>
                                Identify friction points and uncover
                                opportunities to create clearer experiences.
                            </p>
                        </article>
                    </div>
                </section>

                <section className="home-bottom-cta">
                    <div>
                        <h2>Ready to grow a better user experience?</h2>
                        <p>Start exploring your website through your users’ eyes.</p>
                    </div>
                    <button className="hero-primary-button" onClick={onCreateAccount}>
                        Get Started <span aria-hidden="true">→</span>
                    </button>
                </section>
            </main>

            <footer className="home-footer">
                <span>© {new Date().getFullYear()} Rooted Insights</span>
                <span>Better experiences begin with people.</span>
            </footer>
        </div>
    );
}
