import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function ScrollDepth({ scrollDepth }) {
    return (
        <section className="panel panel-outlined">
            <h2>Scroll Depth</h2>

            <p className="card-description">
                How far participants scrolled on the landing page of your site.
            </p>

            {scrollDepth.length === 0 ? (
                <p className="empty-state">No scroll data available yet.</p>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={scrollDepth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="depth"
                            tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            formatter={(value) => [value, "Participants"]}
                            labelFormatter={(value) => `${value}% scroll depth`}
                        />
                        <Bar
                            dataKey="participants"
                            name="Participants"
                            fill="#0f9484"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </section>
    );
}

export default ScrollDepth;