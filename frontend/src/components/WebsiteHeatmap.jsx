function WebsiteHeatmap({ analytics, heatmapData, apiUrl }) {
    return (
        <section className="panel panel-filled">
            <h2>Website Heatmap</h2>
            <p className="card-description">
                This heatmap shows exactly where participants clicked on your site.
            </p>

            {!analytics.screenshotUrl ? (
                <div className="heatmap heatmap-empty">
                    <p className="empty-state">
                        A website screenshot will appear here when available.
                    </p>
                </div>
            ) : (
                <div className="heatmap">
                    <img
                        src={`${apiUrl}${analytics.screenshotUrl}`}
                        alt="Screenshot of the tested website"
                        className="heatmap-background"
                    />

                    <div className="heatmap-overlay">
                        {heatmapData.map((point, index) => {
                            const pageWidth = point.pageWidth || 1440;
                            const pageHeight = point.pageHeight || 900;
                            const x = (point.x / pageWidth) * 100;
                            const y = (point.y / pageHeight) * 100;

                            return (
                                <div
                                    key={index}
                                    className="click-point"
                                    style={{ left: `${x}%`, top: `${y}%` }}
                                    title={`Click ${index + 1}`}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}

export default WebsiteHeatmap;