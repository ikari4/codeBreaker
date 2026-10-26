
import {
    createHmac,
    timingSafeEqual
} from "node:crypto";

const SESSION_DURATION = 7 * 24 * 60 * 60;

function sign(value) {
    return createHmac("sha256", process.env.SESSION_SECRET)
        .update(value)
        .digest("base64url");
}

export function createSessionToken(user) {
    const payload = Buffer.from(
        JSON.stringify({
            id: String(user.id),
            username: user.username,
            exp: Math.floor(Date.now() / 1000) + SESSION_DURATION
        })
    ).toString("base64url");

    return `${payload}.${sign(payload)}`;
}

export function getAuthenticatedUser(req) {
    const cookieHeader = req.headers.cookie || "";

    const sessionCookie = cookieHeader
        .split(";")
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith("codeBreakerSession="));

    if (!sessionCookie || !process.env.SESSION_SECRET) {
        return null;
    }

    const token = sessionCookie.slice(
        "codeBreakerSession=".length
    );

    const parts = token.split(".");

    if (parts.length !== 2) {
        return null;
    }

    const [payload, signature] = parts;
    const expectedSignature = sign(payload);

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
        actualBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
        return null;
    }

    try {
        const user = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8")
        );

        if (
            !user.id ||
            !user.username ||
            !Number.isFinite(user.exp) ||
            user.exp <= Math.floor(Date.now() / 1000)
        ) {
            return null;
        }

        return {
            id: user.id,
            username: user.username
        };

    } catch {
        return null;
    }
}

export function createSessionCookie(token) {
    const secure = process.env.NODE_ENV === "production"
        ? "; Secure"
        : "";

    return [
        `codeBreakerSession=${token}`,
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        `Max-Age=${SESSION_DURATION}`
    ].join("; ") + secure;
}
