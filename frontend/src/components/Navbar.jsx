function Navbar({
    page = "home",
    onNavigate,
    onLogout,
    studies = [],
    studyId,
    onStudyChange
}) {
    const isDashboard = page === "dashboard";
    const isHomeStyle =
        page === "home" ||
        page === "login" ||
        page === "create-account";

    return (
        <nav className={isHomeStyle ? "home-navbar" : "site-navbar"}>

            {/* LOGO */}
            <a
                className={isHomeStyle ? "home-brand" : "site-navbar-brand"}
                href="/"
                onClick={(event) => {
                    event.preventDefault();
                    onNavigate?.("home");
                }}
                aria-label="Rooted Insights home"
            >
                <img
                    src="/RootedInsights.svg"
                    alt="Rooted Insights"
                    className={isHomeStyle ? "" : "site-navbar-logo"}
                />
            </a>

            {/* HOMEPAGE AND AUTH NAVBAR */}
            {isHomeStyle && (
                <>
                    <div className="home-nav-links">
                        <a href="#about" onClick={() => onNavigate?.("home")}>
                            About
                        </a>
                        <a href="#faq" onClick={() => onNavigate?.("home")}>
                            FAQ
                        </a>
                        <a href="#how-it-works" onClick={() => onNavigate?.("home")}>
                            How It Works
                        </a>
                    </div>

                    <div className="home-nav-actions">
                        <button
                            type="button"
                            className="home-login-link"
                            onClick={() => onNavigate?.("login")}
                        >
                            Log In
                        </button>

                        <button
                            type="button"
                            className="home-nav-cta"
                            onClick={() => onNavigate?.("create-account")}
                        >
                            Create Account
                        </button>
                    </div>
                </>
            )}

            {/* RESEARCHER DASHBOARD NAVBAR: Log Out, Create New Study, study picker */}
            {isDashboard && (
                <div className="site-navbar-actions">
                    <button
                        type="button"
                        className="navbar-text-button"
                        onClick={onLogout}
                    >
                        Log Out
                    </button>

                    <button
                        type="button"
                        className="navbar-primary-button"
                        onClick={() => onNavigate?.("new-study")}
                    >
                        Create New Study
                    </button>

                    <label className="study-selector">
                        <span className="sr-only">Change study</span>

                        <select
                            value={studyId ?? ""}
                            onChange={(event) =>
                                onStudyChange?.(Number(event.target.value))
                            }
                            disabled={studies.length === 0}
                        >
                            {(studyId == null || studies.length === 0) && (
                                <option value="" disabled>
                                    No Study Selected
                                </option>
                            )}

                            {studies.map((study) => (
                                <option key={study.id} value={study.id}>
                                    {study.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            )}
        </nav>
    );
}

export default Navbar;