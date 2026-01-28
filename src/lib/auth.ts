import { hash, compare } from 'bcrypt-ts';
import { getDb } from '../db';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session_id';

export async function hashPassword(password: string) {
    return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
    return compare(password, passwordHash);
}

export async function createSession(userId: string) {
    const db = await getDb();
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

    await db.insert(sessions).values({
        id: sessionId,
        userId,
        expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) return null;

    const db = await getDb();
    // Join session with user to get user info if needed, or just validate session
    // For now just get session and userId
    const sessionResult = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();

    if (!sessionResult) return null;

    if (sessionResult.expiresAt < Date.now()) {
        // Expired
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        return null;
    }

    // Refresh session if needed? Or just return valid
    // Return user info
    const user = await db.select().from(users).where(eq(users.id, sessionResult.userId)).get();
    return user;
}

export async function logout() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
        const db = await getDb();
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
}
