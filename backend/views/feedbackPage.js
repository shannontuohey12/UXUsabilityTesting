function createFeedbackPage(studyId, sessionId) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Usability Test Feedback</title>

            <style>
                body {
                    margin: 0;
                    padding: 40px 20px;
                    background: #f5f7ff;
                    font-family: Arial, sans-serif;
                    color: #222;
                }

                .feedback-container {
                    max-width: 650px;
                    margin: 0 auto;
                    background: white;
                    padding: 35px;
                    border-radius: 16px;
                    box-shadow:
                        0 8px 30px rgba(0, 0, 0, 0.08);
                }

                h1 {
                    margin-top: 0;
                    color: #6366f1;
                }

                .intro {
                    color: #666;
                    line-height: 1.6;
                }

                .question {
                    margin-top: 28px;
                }

                .question label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 10px;
                }

                .rating {
                    display: flex;
                    gap: 10px;
                }

                .rating label {
                    cursor: pointer;
                    font-weight: normal;
                }

                textarea {
                    width: 100%;
                    min-height: 100px;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                    resize: vertical;
                }

                button {
                    width: 100%;
                    margin-top: 30px;
                    padding: 13px;
                    border: none;
                    border-radius: 8px;
                    background: #6366f1;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                }

                button:hover {
                    background: #4f46e5;
                }
            </style>
        </head>

        <body>

            <div class="feedback-container">

                <h1> Testing Complete!</h1>

                <p class="intro">
                    Thank you for completing the usability test!
                    Please take a moment to share your experience.
                </p>

                <form method="POST" action="/feedback">

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

                        <label>
                            How easy was the website to use?
                        </label>

                        <div class="rating">
                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="1"
                                    required
                                >
                                1
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="2"
                                >
                                2
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="3"
                                >
                                3
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="4"
                                >
                                4
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="easeOfUse"
                                    value="5"
                                >
                                5
                            </label>
                        </div>

                    </div>


                    <div class="question">

                        <label>
                            How easy were the tasks to complete?
                        </label>

                        <div class="rating">
                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="1"
                                    required
                                >
                                1
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="2"
                                >
                                2
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="3"
                                >
                                3
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="4"
                                >
                                4
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="taskEase"
                                    value="5"
                                >
                                5
                            </label>
                        </div>

                    </div>


                    <div class="question">

                        <label>
                            Was anything confusing or difficult?
                        </label>

                        <textarea
                            name="confusing"
                            placeholder="Tell us about anything that was confusing..."
                        ></textarea>

                    </div>


                    <div class="question">

                        <label>
                            Any additional feedback?
                        </label>

                        <textarea
                            name="additionalFeedback"
                            placeholder="Share any other thoughts..."
                        ></textarea>

                    </div>


                    <button type="submit">
                        Submit Feedback
                    </button>

                </form>

            </div>

        </body>
        </html>
    `;
}

module.exports = {
    createFeedbackPage
};