// api/loginLogic.js
// take input from login form, checks database, saves player info to local storage

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { loginEmail, loginPassword } = req.body;

    if (!loginEmail || !loginPassword) {
        return res.status(400).json({ error: "all fields are required"});
    }

    const client = createClient ({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    try {
        const result = await client.execute({
            sql: "SELECT id, username, email, password FROM players WHERE email = ? LIMIT 1",
            args: [loginEmail]
        });

        let user = result.rows[0];

        // if user exists, check password
        if (user) {
            if (loginPassword !== user.password){
                return res.status(401).json({ error: "invalid credentials" });
            } else {
                user = {
                    id: user.id,
                    username: user.username
                };
            }

        // if not, return error
        } else {
            return res.status(401).json({ error: "user not found" });
        }

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