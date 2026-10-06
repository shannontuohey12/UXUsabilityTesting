const express = require("express");
const router = express.Router();

const db = require("../database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find researcher
        const researcher = db.prepare(`
            SELECT *
            FROM researchers
            WHERE email = ?
        `).get(email);

        if (!researcher) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check password
        const passwordValid =
            await bcrypt.compare(
                password,
                researcher.password_hash
            );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Create session token
        const sessionToken =
            crypto.randomBytes(32).toString("hex");

        const createdAt =
            new Date().toISOString();

        // Save session
        db.prepare(`
            INSERT INTO researcher_sessions (
                researcher_id,
                session_token,
                created_at
            )
            VALUES (?, ?, ?)
        `).run(
            researcher.id,
            sessionToken,
            createdAt
        );

        console.log(
            "RESEARCHER LOGGED IN:",
            researcher.email
        );

        res.json({
            success: true,
            message: "Login successful.",
            sessionToken,
            researcher: {
                id: researcher.id,
                email: researcher.email
            }
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Could not log in."
        });

    }

});

module.exports = router;