
import { useState } from "react";
import "../styles/FeedbackPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function FeedbackPage() {
    const params = new URLSearchParams(window.location.search);

    const studyId = params.get("studyId");
    const sessionId = params.get("sessionId");

    const [easeOfUse, setEaseOfUse] = useState("");
    const [taskEase, setTaskEase] = useState("");
    const [confusing, setConfusing] = useState("");
    const [additionalFeedback, setAdditionalFeedback] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studyId,
                    sessionId,
                    easeOfUse,
                    taskEase,
                    confusing,
                    additionalFeedback
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Unable to submit feedback.");
            }

            setSubmitted(true);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <main className="feedback-page">
                <div className="feedback-page-inner">
                    <div className="feedback-brand">
                        <img
                            src="/RootedInsights.svg"
                            alt="Rooted Insights logo"
                            className="feedback-brand-mark"
                        />
                    </div>

                    <section className="feedback-success">
                        <h1>Thank you!</h1>
                        <p>
                            Your feedback has been submitted. Thank you for
                            helping us grow.
                        </p>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="feedback-page">
            <div className="feedback-page-inner">
                <div className="feedback-brand">
                    <img
                        className="feedback-brand-mark"
                        src="/RootedInsights.svg"
                        alt="Rooted Insights logo"
                    />
                </div>

                <section className="feedback-container">
                    <header className="feedback-hero">
                        <h1>Help us grow.</h1>
                        <p className="feedback-intro">
                            Thank you for taking part in this usability test.
                            Your feedback helps researchers understand what
                            works well and what could be improved.
                        </p>
                    </header>

                    <form className="feedback-form" onSubmit={handleSubmit}>
                        <div className="feedback-question">
                            <span className="feedback-question-title">
                                1. How easy was the website to use?
                            </span>
                            <p className="feedback-hint">
                                Think about how easily you could find your way
                                around the website.
                            </p>

                            <div className="feedback-rating">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <label key={rating}>
                                        <input
                                            type="radio"
                                            name="easeOfUse"
                                            value={rating}
                                            checked={easeOfUse === String(rating)}
                                            onChange={(event) =>
                                                setEaseOfUse(event.target.value)
                                            }
                                            required
                                        />
                                        <span>{rating}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="feedback-rating-legend">
                                <span>Very difficult</span>
                                <span>Very easy</span>
                            </div>
                        </div>

                        <div className="feedback-question">
                            <span className="feedback-question-title">
                                2. How easy were the tasks to complete?
                            </span>
                            <p className="feedback-hint">
                                Consider how clear the instructions were and
                                how easily you could complete each task.
                            </p>

                            <div className="feedback-rating">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <label key={rating}>
                                        <input
                                            type="radio"
                                            name="taskEase"
                                            value={rating}
                                            checked={taskEase === String(rating)}
                                            onChange={(event) =>
                                                setTaskEase(event.target.value)
                                            }
                                            required
                                        />
                                        <span>{rating}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="feedback-rating-legend">
                                <span>Very difficult</span>
                                <span>Very easy</span>
                            </div>
                        </div>

                        <div className="feedback-question">
                            <label
                                className="feedback-question-title"
                                htmlFor="confusing"
                            >
                                3. Was anything confusing or difficult?
                            </label>
                            <p className="feedback-hint">
                                Were there any moments when you weren't sure
                                what to do next?
                            </p>
                            <textarea
                                id="confusing"
                                name="confusing"
                                value={confusing}
                                onChange={(event) =>
                                    setConfusing(event.target.value)
                                }
                                placeholder="Share anything that felt confusing..."
                            />
                        </div>

                        <div className="feedback-question">
                            <label
                                className="feedback-question-title"
                                htmlFor="additionalFeedback"
                            >
                                4. Any additional feedback?
                            </label>
                            <p className="feedback-hint">
                                What did you like, or what would you change?
                            </p>
                            <textarea
                                id="additionalFeedback"
                                name="additionalFeedback"
                                value={additionalFeedback}
                                onChange={(event) =>
                                    setAdditionalFeedback(event.target.value)
                                }
                                placeholder="Anything else you'd like us to know?"
                            />
                        </div>

                        {error && (
                            <p className="feedback-error">{error}</p>
                        )}

                        <button
                            className="feedback-submit-button"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : "Submit Feedback"}
                        </button>
                    </form>
                </section>

                <footer className="feedback-footer">
                    Thoughtfully designed around real people.
                    <br />
                    <strong>Rooted Insights</strong> · Thank you for helping us
                    grow.
                </footer>
            </div>
        </main>
    );
}

export default FeedbackPage;
