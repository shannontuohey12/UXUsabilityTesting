
import { useState } from "react";
import FlowerBackground from "./FlowerBackground";
import "./../styles/Login.css";
import Navbar from "./Navbar";

const API_URL = "http://localhost:3000";

function Login({ onLogin, onCreateAccount }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            localStorage.setItem("sessionToken", data.sessionToken);

            onLogin();

        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Something went wrong. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (page) => {
        if (page === "create-account") {
            onCreateAccount();
        } else if (page === "login") {
            // Already on the login page.
            return;
        } else if (page === "home") {
            // Return to the homepage.
            window.location.href = "/";
        }
    };

    return (
        <main className="auth-page">

            {/* NAVBAR */}
            <Navbar
                page="login"
                onNavigate={handleNavigation}
            />

            {/* FLOWER BACKGROUND */}
            <FlowerBackground />

            {/* LOGIN FORM */}
            <section className="auth-content">
                <div className="auth-form-wrapper">

                    <h1>Log In</h1>

                    <form
                        onSubmit={handleLogin}
                        className="auth-form"
                    >
                        <div className="auth-field">
                            <label htmlFor="login-email">
                                Email
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="researcher@example.com"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password">
                                Password
                            </label>

                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <p className="auth-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={onCreateAccount}
                        >
                            Create account
                        </button>
                    </p>

                </div>
            </section>

        </main>
    );
}

export default Login;
