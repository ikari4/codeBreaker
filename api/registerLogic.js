// api/registerLogic.js
// take input from register form, checks database, saves player info to local storage

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { registerUsername, registerEmail, registerPassword } = req.body;

    if (!registerUsername || !registerEmail || !registerPassword) {
        return res.status(400).json({ error: "all fields are required"});
    }

    if (registerPassword.length < 8) {
        return res.status(400).json({
            error: "password must be at least 8 characters"
        });
    }

    const client = createClient ({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    try {
        const result = await client.execute({
            sql: "SELECT id, username, email, password FROM players WHERE username = ? LIMIT 1",
            args: [registerUsername]
        });

        let user = result.rows[0];

        // if username already exists, return error
        if (user) {
            return res.status(409).json({ error: "username already exists" });
        }

        // check if email already exists
        const emailResult = await client.execute({
            sql: "SELECT id, username, email, password FROM players WHERE email = ? LIMIT 1",
            args: [registerEmail]
        });

        user = emailResult.rows[0];

        // if email already exists, return error
        if (user) {
            return res.status(409).json({ error: "email already exists" });
        }

        // if not, create new user
        const insertResult = await client.execute({
            sql: "INSERT INTO players (username, email, password) VALUES (?, ?, ?)",
            args: [registerUsername, registerEmail, registerPassword]
        });

        const newUserId = insertResult.lastInsertRowid;
        user = {
            id: newUserId,
            username: registerUsername,
        };

        return res.status(200).json({
            user: {
                id: user.id.toString(),
                username: user.username,
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}