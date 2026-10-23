import { createClient } from "@libsql/client";
import { clueLog } from "../clues.js";
import { generatePuzzle } from "../lib/puzzleGenerator.js";

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

// Return today's date in America/New_York as YYYY-MM-DD.
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
    // This endpoint is intended for Vercel Cron.
    // Protect it using the CRON_SECRET environment variable.
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error("CRON_SECRET is not configured.");

        return res.status(500).json({
            error: "Server configuration error."
        });
    }

    const authorization = req.headers.authorization;

    if (authorization !== `Bearer ${cronSecret}`) {
        return res.status(401).json({
            error: "Unauthorized."
        });
    }

    if (req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");

        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    const challengeDate = getChallengeDate();

    try {
        // Check whether today's challenge already exists.
        const existing = await db.execute({
            sql: `
                SELECT id
                FROM challenges
                WHERE challenge_date = ?
                LIMIT 1
            `,
            args: [challengeDate]
        });

        if (existing.rows.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Today's challenge already exists.",
                challengeDate,
                challengeId: existing.rows[0].id
            });
        }

        // Generate all three rounds.
        const rounds = [];
        const solutions = [];

        for (const digitNum of [4, 5, 6]) {
            const puzzle = generatePuzzle(clueLog, digitNum);

            const digits = [...puzzle.solution].map(Number);

            // Store only each clue's name and value in the public puzzle data.
            const clues = puzzle.selectedClues.map(clue => ({
                name: clue.name,
                value: clue.getValue(digits, digitNum)
            }));

            rounds.push({
                digitNum,
                clues
            });

            solutions.push({
                digitNum,
                solution: puzzle.solution
            });
        }

        const puzzleData = JSON.stringify({ rounds });
        const solutionsData = JSON.stringify(solutions);

        // Insert the challenge. The UNIQUE constraint on challenge_date
        // protects against duplicate daily challenges.
        await db.execute({
            sql: `
                INSERT INTO challenges (
                    challenge_date,
                    puzzle_data,
                    solutions
                )
                VALUES (?, ?, ?)
            `,
            args: [
                challengeDate,
                puzzleData,
                solutionsData
            ]
        });

        // Retrieve the newly created record's ID.
        const created = await db.execute({
            sql: `
                SELECT id
                FROM challenges
                WHERE challenge_date = ?
                LIMIT 1
            `,
            args: [challengeDate]
        });

        return res.status(201).json({
            success: true,
            message: "Daily challenge created.",
            challengeDate,
            challengeId: created.rows[0].id
        });

    } catch (error) {
        // Another invocation may have inserted today's challenge
        // after our initial SELECT. The unique constraint protects it.
        const existing = await db.execute({
            sql: `
                SELECT id
                FROM challenges
                WHERE challenge_date = ?
                LIMIT 1
            `,
            args: [challengeDate]
        }).catch(() => ({ rows: [] }));

        if (existing.rows.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Today's challenge already exists.",
                challengeDate,
                challengeId: existing.rows[0].id
            });
        }

        console.error("Daily challenge generation failed:", error);

        return res.status(500).json({
            error: "Unable to create the daily challenge."
        });
    }
}