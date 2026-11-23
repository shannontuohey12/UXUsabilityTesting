function StudyHeader({
    studyName,
    targetUrl,
    studyDescription,
    placeholderDescription,
    generateParticipantLink,
    generatingLink,
    studyId,
    participantLink,
    copyParticipantLink,
    analytics,
    apiUrl,
}) {
    return (
        <section className="page-header">
            <div className="page-header-text">
                <h1>{studyName}</h1>

                {targetUrl && (
                    <div className="website-badge">
                        <span>Target Website:</span>
                        <a href={targetUrl} target="_blank" rel="noreferrer">
                            {targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                    </div>
                )}

                <p className="study-description">
                    {studyDescription || placeholderDescription}
                </p>

                <button
                    className="primary-pill"
                    onClick={generateParticipantLink}
                    disabled={generatingLink || !studyId}
                >
                    {generatingLink ? "Generating..." : "Share Unique Participant Link"}
                </button>

                {participantLink && (
                    <div className="link-box">
                        <input
                            aria-label="Participant link"
                            value={participantLink}
                            readOnly
                        />
                        <button onClick={copyParticipantLink}>Copy</button>
                    </div>
                )}
            </div>

            {analytics.screenshotUrl && (
                <div className="header-screenshot">
                    <img
                        src={`${apiUrl}${analytics.screenshotUrl}`}
                        alt="Screenshot of the tested website"
                    />
                    <span className="selection-handle top-left"></span>
                    <span className="selection-handle top-right"></span>
                    <span className="selection-handle bottom-left"></span>
                    <span className="selection-handle bottom-right"></span>
                    <span className="screenshot-study-label">{studyName}</span>
                </div>
            )}
        </section>
    );
}

export default StudyHeader;