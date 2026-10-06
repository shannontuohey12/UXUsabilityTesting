const express = require("express");
const cors = require("cors");
const db = require("./database");
const path = require("path");
const app = express();

const studiesRoutes = require("./routes/studies");
const participantRoutes = require("./routes/participants");
const feedbackRoutes = require("./routes/feedback");
const eventsRoutes = require("./routes/events");
const analyticsRoutes = require("./routes/analytics");
const proxyRoutes = require("./routes/proxy");
const authRoutes = require("./routes/auth");

const { captureWebsiteScreenshot } = require("./services/screenshotService");

app.use(
    "/screenshots",
    express.static(
        path.join(__dirname, "screenshots")
    )
);

const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/studies", studiesRoutes);
app.use("/api/studies", participantRoutes);
app.use("/", participantRoutes);
app.use("/api/participants", participantRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/api", eventsRoutes);
app.use("/api/studies", analyticsRoutes);
app.use("/proxy", proxyRoutes);
app.use("/api/auth", authRoutes);
// Test route
app.get("/", (req, res) => {
    res.send("UX Research Platform backend is running!");
});



app.get("/tracker.js", (req, res) => {
    res.sendFile(
        path.join(__dirname, "tracker.js")
    );
});



// Start server
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});