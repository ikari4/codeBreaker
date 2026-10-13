
import { createClient } from "@libsql/client";

export default async function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        return response.status(405).json({
            error: "Method not allowed"
        });
    }

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        return response.status(500).json({
            error: "Database configuration is missing"
        });
    }

    const db = createClient({
        url,
        authToken
    });

    try {
        const result = await db.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('players', 'challenges', 'standings') ORDER BY name"
        );

        return response.status(200).json({
            connected: true,
            tables: result.rows.map(row => row.name)
        });
    } catch (error) {
        console.error("Turso connection test failed:", error.message);

        return response.status(500).json({
            connected: false,
            error: "Database connection failed"
        });
    } finally {
        db.close();
    }
}
