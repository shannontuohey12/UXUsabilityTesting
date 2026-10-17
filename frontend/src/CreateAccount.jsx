
import { useState } from "react";

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
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not create your account.");
            }

            if (data.sessionToken) {
                localStorage.setItem("sessionToken", data.sessionToken);
                onAccountCreated();
            } else {
                onLoginPage();
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card create-account-card">
                <p className="auth-eyebrow">ROOTED INSIGHTS</p>

                <h1>Create your account</h1>
                <p>
                    Start turning user behavior into meaningful insights.
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="account-name">Full name</label>
                    <input
                        id="account-name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your full name"
                        required
                    />

                    <label htmlFor="account-email">Email address</label>
                    <input
                        id="account-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                    />

                    <label htmlFor="account-password">Password</label>
                    <input
                        id="account-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="At least 8 characters"
                        minLength={8}
                        required
                    />

                    <label htmlFor="confirm-password">Confirm password</label>
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

                    {error && (
                        <p className="login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={creating}>
                        {creating ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <button type="button" onClick={onLoginPage}>
                        Log in
                    </button>
                </p>
            </section>
        </main>
    );
}

export default CreateAccount;
