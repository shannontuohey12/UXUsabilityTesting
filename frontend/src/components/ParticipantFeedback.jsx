function formatCommentDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}


function ParticipantFeedback({
    feedbackSummary,
    feedbackComments
}) {
    return (
        <section className="panel panel-filled">
            <h2>Participant Feedback</h2>

            <div className="feedback-summary">
                <div className="feedback-stat">
                    <strong>{feedbackSummary.responses ?? 0}</strong>
                    <span>responses</span>
                </div>

                <div className="feedback-stat">
                    <strong>
                        {feedbackSummary.averageEaseOfUse ?? "—"}
                        {feedbackSummary.averageEaseOfUse != null ? "/5" : ""}
                    </strong>
                    <span>website ease</span>
                </div>

                <div className="feedback-stat">
                    <strong>
                        {feedbackSummary.averageTaskEase ?? "—"}
                        {feedbackSummary.averageTaskEase != null ? "/5" : ""}
                    </strong>
                    <span>task ease</span>
                </div>
            </div>

            <div className="feedback-comments">
                <h3>Participant Comments</h3>

                {feedbackComments.length === 0 ? (
                    <p className="empty-state">No written feedback yet.</p>
                ) : (
                    feedbackComments.map((feedback, index) => {
                        const date = formatCommentDate(
                            feedback.createdAt || feedback.created_at
                        );

                        return (
                            <article className="feedback-comment" key={index}>
                                {date && <span className="comment-date">{date}</span>}

                                <p>
                                    <span>Website Ease: </span>
                                    <em>{feedback.easeOfUse ?? "—"}/5</em>
                                </p>

                                <p>
                                    <span>Task Ease: </span>
                                    <em>{feedback.taskEase ?? "—"}/5</em>
                                </p>

                                {feedback.confusing && (
                                    <p>
                                        <span>Difficulties: </span>
                                        <em>{feedback.confusing}</em>
                                    </p>
                                )}

                                {feedback.additionalFeedback && (
                                    <p>
                                        <span>Additional Feedback: </span>
                                        <em>{feedback.additionalFeedback}</em>
                                    </p>
                                )}
                            </article>
                        );
                    })
                )}
            </div>
        </section>
    );
}

export default ParticipantFeedback;