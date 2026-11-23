
function Footer({ onCreateStudy, onLogout }) {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <img
                        src="/RootedInsights.svg"
                        alt="Rooted Insights"
                        className="footer-logo"
                    />
                    <p>Grow your design skills and empower users.</p>
                    <button
                        type="button"
                        className="back-to-top"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                    >
                        Back to Top ↑
                    </button>
                </div>

                <nav className="footer-column" aria-label="Footer">
                    <h4>Navigation</h4>
                    <button type="button" onClick={onCreateStudy}>
                        Create New Study
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                    >
                        Change Study
                    </button>
                    <button type="button" onClick={onLogout}>
                        Log Out
                    </button>
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

export default Footer;
