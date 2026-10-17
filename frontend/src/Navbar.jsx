
function Navbar({
    page = "home",
    onNavigate,
    onLogout,
    studies = [],
    studyId,
    onStudyChange
}) {
    const isDashboard = page === "dashboard";

    return (
        <nav className="site-navbar">
            <a
                className="site-navbar-brand"
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
                    className="site-navbar-logo"
                />
            </a>

            <div className="site-navbar-actions">
                {isDashboard ? (
                    <>
                        <label className="study-selector">
                            <span>Change Study</span>
                            <select
                                value={studyId ?? ""}
                                onChange={(event) =>
                                    onStudyChange?.(
                                        Number(event.target.value)
                                    )
                                }
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
                        </label>

                        <button
                            className="navbar-text-button"
                            onClick={onLogout}
                        >
                            Log Out
                        </button>

                        <button
                            className="navbar-primary-button"
                            onClick={() => onNavigate?.("new-study")}
                        >
                            New Study
                        </button>
                    </>
                ) : page === "login" ? (
                    <>
                        <span className="navbar-prompt">
                            Don't have an account?
                        </span>
                        <button
                            className="navbar-primary-button"
                            onClick={() => onNavigate?.("create-account")}
                        >
                            Create Account
                        </button>
                    </>
                ) : page === "create-account" ? (
                    <>
                        <span className="navbar-prompt">
                            Already have an account?
                        </span>
                        <button
                            className="navbar-primary-button"
                            onClick={() => onNavigate?.("login")}
                        >
                            Log In
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="navbar-text-button"
                            onClick={() => onNavigate?.("login")}
                        >
                            Log In
                        </button>
                        <button
                            className="navbar-primary-button"
                            onClick={() => onNavigate?.("create-account")}
                        >
                            Create Account
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
