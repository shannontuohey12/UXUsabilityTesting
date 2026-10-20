const express = require("express");
const router = express.Router();

const db = require("../database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check whether the email is already registered
        const existingResearcher = db.prepare(`
            SELECT id FROM researchers WHERE email = ?
        `).get(normalizedEmail);

        if (existingResearcher) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash the password before saving it
        const passwordHash = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();

        const result = db.prepare(`
            INSERT INTO researchers (email, password_hash, created_at)
            VALUES (?, ?, ?)
        `).run(normalizedEmail, passwordHash, createdAt);

        const researcherId = result.lastInsertRowid;

        // Create a login session for the new account
        const sessionToken = crypto.randomBytes(32).toString("hex");

        db.prepare(`
            INSERT INTO researcher_sessions (
                researcher_id,
                session_token,
                created_at
            )
            VALUES (?, ?, ?)
        `).run(researcherId, sessionToken, createdAt);

        console.log("RESEARCHER REGISTERED:", normalizedEmail);

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            sessionToken,
            researcher: {
                id: researcherId,
                email: normalizedEmail
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Could not create your account."
        });
    }
});


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