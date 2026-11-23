
import { useState } from "react";
import FlowerBackground from "./FlowerBackground";
import "./../styles/CreateAccount.css";
import Navbar from "./Navbar";

const API_URL = "http://localhost:3000";

function CreateAccount({ onLoginPage, onAccountCreated }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Your password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Your passwords do not match.");
            return;
        }

        setCreating(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not create your account."
                );
            }

            if (data.sessionToken) {
                localStorage.setItem("sessionToken", data.sessionToken);
                onAccountCreated();
            } else {
                onLoginPage();
            }

        } catch (err) {
            console.error("Registration error:", err);
            setError(
                err.message || "Something went wrong. Please try again."
            );

        } finally {
            setCreating(false);
        }
    };

    const handleNavigation = (page) => {
        if (page === "login") {
            onLoginPage();
        } else if (page === "create-account") {
            // Already on the create account page.
            return;
        } else if (page === "home") {
            window.location.href = "/";
        }
    };

    return (
        <main className="auth-page">

            {/* NAVBAR */}
            <Navbar
                page="create-account"
                onNavigate={handleNavigation}
            />

            {/* FLOWER BACKGROUND */}
            <FlowerBackground />

            {/* CREATE ACCOUNT FORM */}
            <section className="auth-content">
                <div className="auth-form-wrapper create-account-wrapper">

                    <h1>Create New Account</h1>

                    <form
                        onSubmit={handleSubmit}
                        className="auth-form"
                    >
                        <div className="auth-field">
                            <label htmlFor="account-name">
                                Full name
                            </label>

                            <input
                                id="account-name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="account-email">
                                Email
                            </label>

                            <input
                                id="account-email"
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
                            <label htmlFor="account-password">
                                Password
                            </label>

                            <input
                                id="account-password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="At least 8 characters"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="confirm-password">
                                Confirm password
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                placeholder="Enter your password again"
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
                            disabled={creating}
                        >
                            {creating
                                ? "Creating account..."
                                : "Create Account"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={onLoginPage}
                        >
                            Log in
                        </button>
                    </p>

                </div>
            </section>

        </main>
    );
}

export default CreateAccount;
