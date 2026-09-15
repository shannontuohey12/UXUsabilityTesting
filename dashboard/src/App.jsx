import { useEffect, useState } from "react";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import "./App.css";

function App() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [studyId, setStudyId] = useState(2);

    useEffect(() => {
        fetch(`http://localhost:3000/api/studies/${studyId}/analytics`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch analytics");
                }

                return response.json();
            })
            .then((data) => {
                setAnalytics(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError("Could not load study analytics.");
                setLoading(false);
            });
    }, [studyId]);

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="dashboard">

            <header className="dashboard-header">
                <div>
                    <h1>UX Research Dashboard</h1>
                    <p>{analytics.study.name}</p>
                </div>

                <div>
                  <select
                      value={studyId}
                      onChange={(event) => {
                          setStudyId(Number(event.target.value));
                          setAnalytics(null);
                          setLoading(true);
                      }}
                  >
                      <option value={2}>Portfolio Usability Test</option>
                      <option value={3}>Shawarma Nomad Usability Test</option>
                  </select>
              </div>
            </header>

            <main>

                <section className="stats-grid">

                    <div className="stat-card">
                        <h3>Participants</h3>
                        <p>{analytics.participants}</p>
                    </div>

                    <div className="stat-card">
                        <h3>Total Events</h3>
                        <p>{analytics.totalEvents}</p>
                    </div>

                    <div className="stat-card">
                        <h3>Page Views</h3>
                        <p>{analytics.pageViews}</p>
                    </div>

                    <div className="stat-card">
                        <h3>Clicks</h3>
                        <p>{analytics.clicks}</p>
                    </div>

                </section>

                <section className="chart-card">

                    <div className="chart-header">
                        <div>
                            <h2>Event Activity</h2>
                            <p>Participant interactions over time</p>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={analytics.eventActivity}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="minute"
                            />

                            <YAxis
                                allowDecimals={false}
                            />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                            />

                        </LineChart>
                    </ResponsiveContainer>

                </section>

                <section className="analytics-grid">

                    <div className="analytics-card">
                        <h2>Event Breakdown</h2>

                        <div className="event-row">
                            <span>Clicks</span>
                            <strong>{analytics.clicks}</strong>
                        </div>

                        <div className="event-row">
                            <span>Page Views</span>
                            <strong>{analytics.pageViews}</strong>
                        </div>

                        <div className="event-row">
                            <span>Scroll Events</span>
                            <strong>{analytics.scrolls}</strong>
                        </div>
                    </div>

                    <div className="analytics-card">
                        <h2>Study Website</h2>

                        <p className="website-url">
                            {analytics.study.targetUrl}
                        </p>
                    </div>
                    <section className="chart-card">
                        <div className="chart-header">
                            <div>
                                <h2>Scroll Depth</h2>
                                <p>How far participants scrolled on the website</p>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.scrollDepth}>
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="depth"
                                    tickFormatter={(value) => `${value}%`}
                                />

                                <YAxis allowDecimals={false} />

                                <Tooltip
                                    formatter={(value) => [
                                        value,
                                        "Participants"
                                    ]}
                                    labelFormatter={(value) =>
                                        `${value}% scroll depth`
                                    }
                                />

                                <Bar
                                    dataKey="participants"
                                    fill="#6366f1"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>

                    </section>
                    <div className="analytics-card most-clicked-card">

                      <h2>Most Clicked Elements</h2>

                      <p className="card-description">
                          Elements participants interacted with most often
                      </p>

                      <div className="clicked-elements">

                          {analytics.mostClickedElements.length === 0 ? (

                              <p>No click data available yet.</p>

                          ) : (

                              analytics.mostClickedElements
                                  .slice(0, 5)
                                  .map((item, index) => (

                                      <div
                                          className="clicked-element-row"
                                          key={item.element}
                                      >

                                          <div className="element-info">

                                              <span className="element-rank">
                                                  {index + 1}
                                              </span>

                                              <span className="element-name">
                                                  {item.element}
                                              </span>

                                          </div>

                                          <strong>
                                              {item.clicks}
                                          </strong>

                                      </div>

                                  ))

                          )}

                      </div>

                  </div>

                </section>

            </main>

        </div>
    );
}

export default App;