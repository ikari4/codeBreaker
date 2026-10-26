
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

    // Verify the player's signed session cookie.
    const user = getAuthenticatedUser(req);

    if (!user) {
        return res.status(401).json({
            error: "Please log in to play."
        });
    }

    const digitCount = Number(req.body?.digitNum);
    const guess = req.body?.guess;

    if (
        ![4, 5, 6].includes(digitCount) ||
        typeof guess !== "string" ||
        !new RegExp(`^\\d{${digitCount}}$`).test(guess)
    ) {
        return res.status(400).json({
            error: "Invalid guess."
        });
    }

    const challengeDate = getChallengeDate();

    try {
        // Find today's challenge and this player's attempt status.
        const result = await db.execute({
            sql: `
                SELECT c.id, c.solutions, s.status
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
                error: "You must start today's challenge first."
            });
        }

        if (result.rows[0].status !== "in_progress") {
            return res.status(409).json({
                error: "Today's challenge is no longer in progress."
            });
        }

        const solutions = JSON.parse(result.rows[0].solutions);

        const round = solutions.find(
            item => item.digitNum === digitCount
        );

        if (!round) {
            return res.status(404).json({
                error: "Challenge round not found."
            });
        }

        return res.status(200).json({
            correct: guess === round.solution
        });

    } catch (error) {
        console.error("Daily guess check failed:", error);

        return res.status(500).json({
            error: "Unable to check your guess."
        });
    }
}

