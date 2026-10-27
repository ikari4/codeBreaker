
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
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    const user = getAuthenticatedUser(req);

    if (!user) {
        return res.status(401).json({
            error: "Please log in to view standings."
        });
    }

    try {
        const today = getChallengeDate();

        const result = await db.execute({
            sql: `
                SELECT
                    p.id AS player_id,
                    p.username,
                    c.challenge_date,
                    s.status,
                    s.completion_time_seconds
                FROM players p
                LEFT JOIN standings s
                    ON s.player_id = p.id
                LEFT JOIN challenges c
                    ON c.id = s.challenge_id
                    AND c.challenge_date <= ?
                ORDER BY p.username, c.challenge_date DESC
            `,
            args: [today]
        });

        const players = new Map();

        for (const row of result.rows) {
            const playerId = String(row.player_id);

            if (!players.has(playerId)) {
                players.set(playerId, {
                    playerId,
                    username: row.username,
                    todayTime: null,
                    todayStatus: null,
                    datesPlayed: [],
                    recentTimes: []
                });
            }

            const player = players.get(playerId);

            if (!row.challenge_date) continue;

            const date = String(row.challenge_date);

            if (date === today) {
                player.todayStatus = row.status;

                if (row.status === "completed") {
                    player.todayTime =
                        Number(row.completion_time_seconds);
                }
            }

            // Track days played, including unfinished attempts.
            player.datesPlayed.push(date);

            // Only completed games contribute to the 30-day average.
            const daysAgo = (
                new Date(`${today}T12:00:00Z`) -
                new Date(`${date}T12:00:00Z`)
            ) / 86400000;

            if (
                daysAgo >= 0 &&
                daysAgo < 30 &&
                row.status === "completed" &&
                row.completion_time_seconds !== null
            ) {
                player.recentTimes.push(
                    Number(row.completion_time_seconds)
                );
            }
        }

        const standings = [...players.values()].map(player => {
            const dates = [...new Set(player.datesPlayed)].sort().reverse();

            let streak = 0;
            let expectedDate = today;

            for (const date of dates) {
                if (date === expectedDate) {
                    streak++;
                    const previous = new Date(
                        `${expectedDate}T12:00:00Z`
                    );
                    previous.setUTCDate(previous.getUTCDate() - 1);
                    expectedDate = previous.toISOString().slice(0, 10);
                } else if (date < expectedDate) {
                    break;
                }
            }

            const averageTime = player.recentTimes.length
                ? player.recentTimes.reduce((sum, time) => sum + time, 0) /
                    player.recentTimes.length
                : null;

            return {
                username: player.username,
                todayTime: player.todayTime,
                todayStatus: player.todayStatus,
                streak,
                averageTime: averageTime === null
                    ? null
                    : Number(averageTime.toFixed(1)),
                gamesPlayed: player.datesPlayed.filter(date => {
                    const daysAgo = (
                        new Date(`${today}T12:00:00Z`) -
                        new Date(`${date}T12:00:00Z`)
                    ) / 86400000;

                    return daysAgo >= 0 && daysAgo < 30;
                }).length
            };
        });

        // Completed players rank by today's time; unfinished players follow.
        standings.sort((a, b) => {
            if (a.todayTime === null && b.todayTime !== null) return 1;
            if (a.todayTime !== null && b.todayTime === null) return -1;
            if (a.todayTime !== null && b.todayTime !== null) {
                return a.todayTime - b.todayTime;
            }
            return a.username.localeCompare(b.username);
        });

        return res.status(200).json({
            success: true,
            challengeDate: today,
            standings: standings.map((player, index) => ({
                rank: player.todayTime === null ? null : index + 1,
                ...player
            }))
        });

    } catch (error) {
        console.error("Daily standings failed:", error);

        return res.status(500).json({
            error: "Unable to load daily standings."
        });
    }
}
