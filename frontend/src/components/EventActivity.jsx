import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function EventActivity({ eventActivity }) {
    return (
        <section className="panel panel-outlined">
            <h2>Event Activity</h2>

            {eventActivity.length === 0 ? (
                <p className="empty-state">
                    Interaction data will appear here as participants use the website.
                </p>
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={eventActivity}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="minute" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Interactions" radius={[4, 4, 0, 0]}>
                            {eventActivity.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={index % 2 === 0 ? "#b4dacd" : "#4a9488"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </section>
    );
}

export default EventActivity;