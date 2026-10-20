
function createFeedbackPage(studyId, sessionId) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Share Your Feedback | Rooted Insights</title>

            <style>
                :root {
                    --teal: #397d78;
                    --teal-dark: #285e5a;
                    --sage: #dce8d9;
                    --sage-light: #f0f5ed;
                    --cream: #fafbf7;
                    --text: #263b36;
                    --muted: #71817a;
                    --border: #e0e8df;
                    --white: #ffffff;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    min-height: 100vh;
                    padding: 48px 20px;
                    background:
                        radial-gradient(
                            circle at 5% 5%,
                            rgba(195, 218, 194, 0.45),
                            transparent 30%
                        ),
                        radial-gradient(
                            circle at 95% 90%,
                            rgba(184, 218, 211, 0.35),
                            transparent 30%
                        ),
                        var(--cream);
                    font-family: -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                    color: var(--text);
                }

                .page {
                    max-width: 720px;
                    margin: 0 auto;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 30px;
                    color: var(--teal-dark);
                    font-size: 21px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .brand-logo {
                    display: block;
                    width: 220px;
                    max-width: 80%;
                    height: auto;
                    margin: 0 auto;
                    object-fit: contain;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 30px;
                }

                .feedback-container {
                    overflow: hidden;
                    background: var(--white);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    box-shadow: 0 16px 45px rgba(42, 77, 64, 0.08);
                }

                .hero {
                    padding: 38px 42px 30px;
                    background: var(--sage-light);
                    border-bottom: 1px solid var(--border);
                }

                .eyebrow {
                    margin: 0 0 12px;
                    color: var(--teal);
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 1.8px;
                    text-transform: uppercase;
                }

                h1 {
                    margin: 0 0 14px;
                    font-size: clamp(28px, 5vw, 38px);
                    line-height: 1.2;
                    letter-spacing: -1.2px;
                }

                .intro {
                    max-width: 510px;
                    margin: 0;
                    color: var(--muted);
                    font-size: 15px;
                    line-height: 1.8;
                }

                .form-content {
                    padding: 10px 42px 38px;
                }

                .question {
                    margin-top: 30px;
                    padding-bottom: 26px;
                    border-bottom: 1px solid #edf0eb;
                }

                .question:last-of-type {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .question-title {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 15px;
                    font-weight: 650;
                    line-height: 1.6;
                }

                .hint {
                    margin: 0 0 16px;
                    color: var(--muted);
                    font-size: 13px;
                    line-height: 1.6;
                }

                .rating {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .rating label {
                    position: relative;
                    cursor: pointer;
                }

                .rating input {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }

                .rating span {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 46px;
                    height: 46px;
                    border: 1px solid var(--border);
                    border-radius: 13px;
                    background: var(--white);
                    color: var(--text);
                    font-size: 15px;
                    transition: background 0.15s, border-color 0.15s;
                }

                .rating label:hover span {
                    border-color: var(--teal);
                }

                .rating input:checked + span {
                    border-color: var(--teal);
                    background: var(--teal);
                    color: white;
                    font-weight: 700;
                }

                .rating input:focus-visible + span {
                    outline: 3px solid #a8cfbf;
                    outline-offset: 3px;
                }

                .rating-legend {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    color: var(--muted);
                    font-size: 12px;
                }

                textarea {
                    display: block;
                    width: 100%;
                    min-height: 115px;
                    padding: 15px;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    background: #fcfdfb;
                    color: var(--text);
                    font: inherit;
                    font-size: 14px;
                    line-height: 1.6;
                    resize: vertical;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }

                textarea::placeholder {
                    color: #9aa69e;
                }

                textarea:focus {
                    outline: none;
                    border-color: var(--teal);
                    box-shadow: 0 0 0 3px rgba(57, 125, 120, 0.12);
                }

                .submit-button {
                    display: block;
                    width: 100%;
                    margin-top: 32px;
                    padding: 16px 20px;
                    border: none;
                    border-radius: 12px;
                    background: var(--teal);
                    color: white;
                    font: inherit;
                    font-size: 15px;
                    font-weight: 650;
                    cursor: pointer;
                    transition: background 0.15s, transform 0.15s;
                }

                .submit-button:hover {
                    background: var(--teal-dark);
                    transform: translateY(-1px);
                }

                .submit-button:focus-visible {
                    outline: 3px solid #a8cfbf;
                    outline-offset: 3px;
                }

                .footer {
                    padding: 22px 15px 0;
                    color: var(--muted);
                    font-size: 12px;
                    text-align: center;
                    line-height: 1.7;
                }

                .footer strong {
                    color: var(--teal);
                    font-weight: 650;
                }

                @media (max-width: 520px) {
                    body {
                        padding: 28px 14px;
                    }

                    .brand {
                        margin-bottom: 22px;
                    }

                    .hero {
                        padding: 28px 24px;
                    }

                    .form-content {
                        padding: 8px 24px 28px;
                    }

                    .rating {
                        gap: 8px;
                    }

                    .rating span {
                        width: 42px;
                        height: 42px;
                    }
                }
            </style>
        </head>

        <body>
            <main class="page">
                <div class="brand">
                    <img
                        class="brand-mark"
                        src="/assets/RootedInsights.svg"
                        alt="Rooted Insights logo"
                    >
                </div>

                <section class="feedback-container">
                    <header class="hero">
                        <p class="eyebrow">Your experience matters</p>
                        <h1>Help us grow.</h1>
                        <p class="intro">
                            Thank you for taking part in this usability test.
                            Your feedback helps researchers understand what
                            works well and what could be improved.
                        </p>
                    </header>

                    <form
                        class="form-content"
                        method="POST"
                        action="/feedback"
                    >
                        <input
                            type="hidden"
                            name="studyId"
                            value="${studyId}"
                        >

                        <input
                            type="hidden"
                            name="sessionId"
                            value="${sessionId}"
                        >

                        <div class="question">
                            <span class="question-title">
                                1. How easy was the website to use?
                            </span>
                            <p class="hint">
                                Think about how easily you could find your
                                way around the website.
                            </p>

                            <div class="rating">
                                ${[1, 2, 3, 4, 5].map((rating) => `
                                    <label>
                                        <input
                                            type="radio"
                                            name="easeOfUse"
                                            value="${rating}"
                                            required
                                        >
                                        <span>${rating}</span>
                                    </label>
                                `).join("")}
                            </div>

                            <div class="rating-legend">
                                <span>Very difficult</span>
                                <span>Very easy</span>
                            </div>
                        </div>

                        <div class="question">
                            <span class="question-title">
                                2. How easy were the tasks to complete?
                            </span>
                            <p class="hint">
                                Consider how clear the instructions were and
                                how easily you could complete each task.
                            </p>

                            <div class="rating">
                                ${[1, 2, 3, 4, 5].map((rating) => `
                                    <label>
                                        <input
                                            type="radio"
                                            name="taskEase"
                                            value="${rating}"
                                            required
                                        >
                                        <span>${rating}</span>
                                    </label>
                                `).join("")}
                            </div>

                            <div class="rating-legend">
                                <span>Very difficult</span>
                                <span>Very easy</span>
                            </div>
                        </div>

                        <div class="question">
                            <label class="question-title" for="confusing">
                                3. Was anything confusing or difficult?
                            </label>
                            <p class="hint">
                                Were there any moments when you weren't sure
                                what to do next?
                            </p>
                            <textarea
                                id="confusing"
                                name="confusing"
                                placeholder="Share anything that felt confusing..."
                            ></textarea>
                        </div>

                        <div class="question">
                            <label class="question-title" for="additionalFeedback">
                                4. Any additional feedback?
                            </label>
                            <p class="hint">
                                What did you like, or what would you change?
                            </p>
                            <textarea
                                id="additionalFeedback"
                                name="additionalFeedback"
                                placeholder="Anything else you'd like us to know?"
                            ></textarea>
                        </div>

                        <button class="submit-button" type="submit">
                            Submit Feedback
                        </button>
                    </form>
                </section>

                <footer class="footer">
                    Thoughtfully designed around real people.<br>
                    <strong>Rooted Insights</strong> · Thank you for helping us grow.
                </footer>
            </main>
        </body>
        </html>
    `;
}

module.exports = {
    createFeedbackPage
};
