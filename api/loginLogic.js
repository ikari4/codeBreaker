// api/loginLogic.js
// take input from login form, checks database, saves player info to local storage

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
    if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
    }

    const { inputUsername, inputPassword } = req.body;
    if (!inputUsername || !inputPassword) {
    return res.status(400).json({ error: "Username and password required"});
    }

    if (inputPassword.length < 8) {
        return res.status(400).json({
            error: "Password must be at least 8 characters"
        });
    }

    const client = createClient ({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    try {
        const result = await client.execute({
            sql: "SELECT id, username, password FROM players WHERE username = ? LIMIT 1",
            args: [inputUsername]
        });

        let user = result.rows[0];

        if (user) {
            if (inputPassword !== user.password){
                return res.status(401).json({ error: "Invalid credentials" });
            } else {
                user = {
                    id: user.id,
                    username: user.username
                };
            }

        } else {
            const insertResult = await client.execute({
                sql: "INSERT INTO players (username, password) VALUES (?, ?)",
                args: [inputUsername, inputPassword]
            });

            const newUserId = insertResult.lastInsertRowid;
            user = {
                id: newUserId,
                username: inputUsername
            };
        }

        return res.status(200).json({
            user: {
                id: user.id.toString(),
                username: user.username,
                email: user.email
            }
        });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    }