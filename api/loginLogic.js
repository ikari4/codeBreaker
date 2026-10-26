// api/loginLogic.js
// take input from login form, checks database, saves player info to local storage

import { createClient } from "@libsql/client";
import { createSessionToken, createSessionCookie } from "../lib/session.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const { loginEmail, loginPassword } = req.body;

    if (!loginEmail || !loginPassword) {
        return res.status(400).json({ error: "login: all fields are required"});
    }

    if (!process.env.SESSION_SECRET) {
        console.error("SESSION_SECRET is not configured");

        return res.status(500).json({
            error: "Server configuration error"
        });
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


        if (!user || loginPassword !== user.password) {
            return res.status(401).json({
                error: "login: invalid credentials"
            });
        }

        const authenticatedUser = {
            id: String(user.id),
            username: user.username
        };

        const token = createSessionToken(authenticatedUser);

        res.setHeader(
            "Set-Cookie",
            createSessionCookie(token)
        );

        return res.status(200).json({
            user: authenticatedUser
        });

    } catch (error) {
        console.error("login failed:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}