
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
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    const { guess, digitNum } = req.body ?? {};

    if (
        ![4, 5, 6].includes(Number(digitNum)) ||
        typeof guess !== "string" ||
        !new RegExp(`^\\d{${Number(digitNum)}}$`).test(guess)
    ) {
        return res.status(400).json({
            error: "Invalid guess."
        });
    }

    const challengeDate = getChallengeDate();

    try {
        const result = await db.execute({
            sql: `
                SELECT solutions
                FROM challenges
                WHERE challenge_date = ?
                LIMIT 1
            `,
            args: [challengeDate]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Today's challenge is not available."
            });
        }

        const solutions = JSON.parse(result.rows[0].solutions);

        const round = solutions.find(
            item => item.digitNum === Number(digitNum)
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
