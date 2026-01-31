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
    group_id: z.string().min(1),
});

export async function loginAction(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = authSchema.safeParse(data);

    if (!parsed.success) {
        return { error: '入力内容が正しくありません' };
    }

    const { username, password, group_id } = parsed.data;
    const db = await getDb();

    // Check username and group_id
    // Security Note: We should verify both. 
    const user = await db.select().from(users)
        .where(eq(users.username, username))
        .get();

    if (!user || !(await verifyPassword(password, user.password_hash))) {
        return { error: 'ユーザー名またはパスワードが違います' };
    }

    if (user.group_id !== group_id) {
        return { error: '家族IDが一致しません' };
    }

    await createSession(user.id);
    redirect('/');
}

const itemSchema = z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    memo: z.string().optional(),
    is_memo_only: z.string().optional(), // Checkbox "true"
    add_to_shopping_list: z.string().optional(), // New checkbox "true"
    is_shared: z.string().optional(), // New checkbox "true"
});

export async function addItemAction(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = itemSchema.safeParse(data);

    if (!parsed.success) {
        return { error: '入力内容が正しくありません' };
    }

    const { name, category, memo, is_memo_only, add_to_shopping_list, is_shared } = parsed.data;
    const db = await getDb();

    const user = await import('./auth').then(m => m.getSession());
    if (!user) {
        return { error: '認証されていません' };
    }

    // specific logic: if "is_memo_only" (one-time), we likely want it in shopping list immediately -> status 2
    // if "add_to_shopping_list" checked -> status 2
    // default -> status 0 (Plenty)
    let initialStatus = 0;
    if (is_memo_only === 'true' || add_to_shopping_list === 'true') {
        initialStatus = 2; // Empty/Need to buy
    }

    await db.insert(items).values({
        name,
        category: category || '未分類',
        memo: memo || null,
        status: initialStatus,
        is_shared: is_shared !== 'false', // Default to true if not specified? Or checkbox logic. Let's assume default checked in UI.
        is_memo_only: is_memo_only === 'true',
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
        return { success: false, error: '入力内容が正しくありません（ユーザー名は3文字以上、パスワードは6文字以上）' };
    }

    const { username, password, group_id } = parsed.data;
    const db = await getDb();

    const existing = await db.select().from(users).where(eq(users.username, username)).get();
    if (existing) {
        return { success: false, error: 'そのユーザー名は既に使用されています' };
    }

    const passwordHash = await hashPassword(password);

    // Insert user
    const newUser = await db.insert(users).values({
        username,
        password_hash: passwordHash,
        group_id: group_id, // Use provided group_id
    }).returning({ id: users.id }).get();

    // Usually admin creates user, so maybe don't auto-login? 
    // But for this flow, let's keep it simple. If admin adds, maybe redirect to admin?
    // User requested: "/admin allows registering new users".
    // If we redirect to '/', admin loses context. 
    // Let's NOT login automatically if this is an admin action?
    // But `registerAction` is currently generic.
    // Let's create `adminRegisterAction` or modify this to support redirecting back.
    // However, for now, let's assume this action is used by the Admin Page form.
    // If I use `redirect` here, it throws Next.js redirection error which is handled by Next.js.

    // Changing behavior: Do NOT login. Return success so UI can show "Created".
    // await createSession(newUser.id);
    // redirect('/');

    // Wait, if I change this, the original tests might break if any. But user said "Modify flow".

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin');
    return { success: true };
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

export async function toggleShouldBuyAction(itemId: string, currentVal: boolean) {
    const user = await import('./auth').then(m => m.getSession());
    if (!user) return { error: 'Unauthorized' };

    const db = await getDb();
    await db.update(items)
        .set({ should_buy: !currentVal, updated_by: user.username, updated_at: new Date().toISOString() })
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

export async function updateItemAction(itemId: string, name: string, memo: string | null, category: string | null, is_shared: boolean, is_memo_only: boolean) {
    const user = await import('./auth').then(m => m.getSession());
    if (!user) return { error: 'Unauthorized' };

    const db = await getDb();

    await db.update(items)
        .set({
            name,
            memo: memo || null,
            category: category || '未分類',
            is_shared: is_shared,
            is_memo_only: is_memo_only,
            updated_by: user.username,
            updated_at: new Date().toISOString()
        })
        .where(eq(items.id, itemId));

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    return { success: true };
}

export async function deleteItemAction(itemId: string) {
    const user = await import('./auth').then(m => m.getSession());
    if (!user) return { error: 'Unauthorized' };

    const db = await getDb();

    await db.delete(items).where(eq(items.id, itemId));

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    return { success: true };
}
