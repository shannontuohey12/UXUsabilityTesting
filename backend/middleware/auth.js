const db = require("../database");

function requireAuth(req, res, next) {

    const sessionToken =
        req.headers.authorization?.replace("Bearer ", "");

    if (!sessionToken) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    const session = db.prepare(`
        SELECT
            researcher_sessions.id,
            researcher_sessions.researcher_id,
            researchers.email
        FROM researcher_sessions
        JOIN researchers
            ON researchers.id =
               researcher_sessions.researcher_id
        WHERE researcher_sessions.session_token = ?
    `).get(sessionToken);

    if (!session) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session."
        });
    }

    // Store researcher information on the request
    req.researcher = {
        id: session.researcher_id,
        email: session.email
    };

    next();
}

module.exports = {
    requireAuth
};