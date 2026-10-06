const bcrypt = require("bcrypt");
const db = require("./database");

async function createResearcher() {

    const email = "shannon@example.com";
    const password = "password123";

    const passwordHash =
        await bcrypt.hash(password, 10);

    const insert = db.prepare(`
        INSERT INTO researchers (
            email,
            password_hash,
            created_at
        )
        VALUES (?, ?, ?)
    `);

    insert.run(
        email,
        passwordHash,
        new Date().toISOString()
    );

    console.log("Researcher created!");
    console.log("Email:", email);
    console.log("Password:", password);
}

createResearcher();