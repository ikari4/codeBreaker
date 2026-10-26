
import { createClient } from "@libsql/client";
import { getAuthenticatedUser } from "../lib/session.js";

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
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    const user = getAuthenticatedUser(req);

    if (!user) {
        return res.status(401).json({
            error: "Please log in to complete the challenge."
        });
    }

    const challengeDate = getChallengeDate();

    try {
        const result = await db.execute({
            sql: `
                SELECT c.id AS challenge_id, s.status, s.started_at
                FROM challenges c
                JOIN standings s
                  ON s.challenge_id = c.id
                WHERE c.challenge_date = ?
                  AND s.player_id = ?
                LIMIT 1
            `,
            args: [challengeDate, Number(user.id)]
        });

        if (result.rows.length === 0) {
            return res.status(403).json({
                error: "No started challenge was found for today."
            });
        }

        const attempt = result.rows[0];

        if (attempt.status !== "in_progress") {
            return res.status(409).json({
                error: "Today's challenge has already been completed."
            });
        }

        // Calculate elapsed time using the server's recorded start time.
        const startedAt = new Date(
            String(attempt.started_at).replace(" ", "T") + "Z"
        );

        const elapsedSeconds =
            (Date.now() - startedAt.getTime()) / 1000;

        if (
            !Number.isFinite(elapsedSeconds) ||
            elapsedSeconds < 0
        ) {
            return res.status(500).json({
                error: "Unable to calculate challenge time."
            });
        }


        const completionTime = Number(elapsedSeconds.toFixed(1));

        const updateResult = await db.execute({
            sql: `
                UPDATE standings
                SET status = 'completed',
                    completed_at = CURRENT_TIMESTAMP,
                    completion_time_seconds = ?
                WHERE player_id = ?
                    AND challenge_id = ?
                    AND status = 'in_progress'
            `,
            args: [
                completionTime,
                Number(user.id),
                Number(attempt.challenge_id)
            ]
        });

        if (Number(updateResult.rowsAffected) !== 1) {
            return res.status(409).json({
                error: "Challenge has already been completed."
            });
        }

        return res.status(200).json({
            success: true,
            completionTimeSeconds: completionTime
        });


    } catch (error) {
        console.error("Challenge completion failed:", error);

        return res.status(500).json({
            error: "Unable to save challenge completion."
        });
    }
}
