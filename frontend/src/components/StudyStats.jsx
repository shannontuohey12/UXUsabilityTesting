
function StudyStats({ analytics }) {
    return (
        <section className="panel panel-filled stats-panel">
            <h2>Study Stats</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <p>{analytics.participants ?? 0}</p>
                    <h3>participants</h3>
                </div>

                <div className="stat-card">
                    <p>{analytics.totalEvents ?? 0}</p>
                    <h3>total events</h3>
                </div>

                <div className="stat-card">
                    <p>{analytics.pageViews ?? 0}</p>
                    <h3>page views</h3>
                </div>

                <div className="stat-card">
                    <p>{analytics.clicks ?? 0}</p>
                    <h3>clicks</h3>
                </div>
            </div>
        </section>
    );
}

export default StudyStats;
