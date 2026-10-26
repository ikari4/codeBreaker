
import { createClient } from "@libsql/client";
import { getAuthenticatedUser } from "../lib/session.js";

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

function getChallengeDate() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const user = getAuthenticatedUser(req);

    if (!user) {
        return res.status(401).json({
            error: "Please log in to play the daily challenge."
        });
    }

    const challengeDate = getChallengeDate();

    try {
        // Find today's challenge.
        const challengeResult = await db.execute({
            sql: `
                SELECT id, challenge_date, puzzle_data
                FROM challenges
                WHERE challenge_date = ?
                LIMIT 1
            `,
            args: [challengeDate]
        });

        if (challengeResult.rows.length === 0) {
            return res.status(404).json({
                error: "Today's challenge is not available yet."
            });
        }

        const challenge = challengeResult.rows[0];

        // Check whether this player has already opened today's challenge.
        const existingResult = await db.execute({
            sql: `
                SELECT status
                FROM standings
                WHERE player_id = ? AND challenge_id = ?
                LIMIT 1
            `,
            args: [Number(user.id), Number(challenge.id)]
        });

        if (existingResult.rows.length > 0) {
            return res.status(409).json({
                error: "You have already started today's challenge.",
                status: existingResult.rows[0].status
            });
        }

        // Record the attempt immediately when the challenge is opened.
        await db.execute({
            sql: `
                INSERT INTO standings (
                    player_id,
                    challenge_id,
                    status
                )
                VALUES (?, ?, 'in_progress')
            `,
            args: [Number(user.id), Number(challenge.id)]
        });

        return res.status(200).json({
            success: true,
            challengeId: String(challenge.id),
            challengeDate: challenge.challenge_date,
            rounds: JSON.parse(challenge.puzzle_data).rounds
        });

    } catch (error) {
        console.error("startDailyChallenge failed:", error);

        return res.status(500).json({
            error: "Unable to start today's challenge."
        });
    }
}
