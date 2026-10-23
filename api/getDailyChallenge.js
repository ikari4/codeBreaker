
 // api/getDailyChallenge.js
import { createClient } from "@libsql/client";

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

function getChallengeDate() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    const challengeDate = getChallengeDate();

    try {
        const result = await db.execute({
            sql: `
                SELECT id, challenge_date, puzzle_data
                FROM challenges
                WHERE challenge_date = ?
                LIMIT 1
            `,
            args: [challengeDate]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Today's challenge has not been created yet.",
                challengeDate
            });
        }

        const row = result.rows[0];
        const puzzleData = JSON.parse(row.puzzle_data);

        // Return public clues only. Never return the solutions column.
        return res.status(200).json({
            success: true,
            challengeId: String(row.id),
            challengeDate: row.challenge_date,
            rounds: puzzleData.rounds
        });
    } catch (error) {
        console.error("Unable to retrieve daily challenge:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to retrieve today's challenge."
        });
    }
}
