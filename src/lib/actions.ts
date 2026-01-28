'use server';

import { redirect } from 'next/navigation';
import { getDb } from '../db';
import { users, items } from '../db/schema';
import { hashPassword, verifyPassword, createSession, logout as logoutAuth } from './auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// ... authSchema ... (kept for brevity in thought but removal in file)
// actually removing lines 8-16
const mockGroupId = 'family-group-1'; // Default group for now


const authSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});

export async function loginAction(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = authSchema.safeParse(data);

    if (!parsed.success) {
        return { error: '入力内容が正しくありません' };
    }

    const { username, password } = parsed.data;
    const db = await getDb();

    const user = await db.select().from(users).where(eq(users.username, username)).get();

    if (!user || !(await verifyPassword(password, user.password_hash))) {
        return { error: 'ユーザー名またはパスワードが違います' };
    }

    await createSession(user.id);
    redirect('/');
}

const itemSchema = z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    is_memo_only: z.string().optional(), // Checkbox returns "true" or undefined
});

export async function addItemAction(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = itemSchema.safeParse(data);

    if (!parsed.success) {
        return { error: '入力内容が正しくありません' };
    }

    const { name, category, is_memo_only } = parsed.data;
    const db = await getDb();

    const user = await import('./auth').then(m => m.getSession());
    if (!user) {
        return { error: '認証されていません' };
    }

    await db.insert(items).values({
        name,
        category: category || 'uncategorized',
        is_memo_only: is_memo_only === 'true',
        status: 0, // Plenty by default
        owner_id: user.id,
        group_id: user.group_id,
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');

    return { success: true };
}

export async function registerAction(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = authSchema.safeParse(data);

    if (!parsed.success) {
        return { error: '入力内容が正しくありません（ユーザー名は3文字以上、パスワードは6文字以上）' };
    }

    const { username, password } = parsed.data;
    const db = await getDb();

    const existing = await db.select().from(users).where(eq(users.username, username)).get();
    if (existing) {
        return { error: 'そのユーザー名は既に使用されています' };
    }

    const passwordHash = await hashPassword(password);

    // Insert user
    const newUser = await db.insert(users).values({
        username,
        password_hash: passwordHash,
        group_id: mockGroupId,
    }).returning({ id: users.id }).get();

    await createSession(newUser.id);
    redirect('/');
}

export async function toggleItemStatusAction(itemId: string, currentStatus: number) {
    const user = await import('./auth').then(m => m.getSession());
    if (!user) return { error: 'Unauthorized' };

    const db = await getDb();

    // Logic: 0 -> 1 -> 2 -> 0 (loop in stock mode?)
    // Or: Plenty(0) -> Low(1) -> Empty(2) -> Plenty(0)
    const nextStatus = (currentStatus + 1) % 3;

    await db.update(items)
        .set({ status: nextStatus, updated_by: user.username, updated_at: new Date().toISOString() }) // Use params or sql? drizzle handles date? using string for text column
        .where(eq(items.id, itemId));

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
}

export async function checkItemAction(itemId: string) {
    // Shopping mode: Check -> Mark as Plenty (0)
    const user = await import('./auth').then(m => m.getSession());
    if (!user) return { error: 'Unauthorized' };

    const db = await getDb();

    await db.update(items)
        .set({ status: 0, updated_by: user.username, updated_at: new Date().toISOString() })
        .where(eq(items.id, itemId));

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
}

export async function logoutAction() {
    await logoutAuth();
    redirect('/login');
}
