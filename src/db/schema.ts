import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    username: text('username').notNull().unique(),
    password_hash: text('password_hash').notNull(),
    group_id: text('group_id'), // For sharing with family
    created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const items = sqliteTable('items', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    category: text('category').default('uncategorized'),
    memo: text('memo'),

    // 0: Plenty, 1: Low, 2: Empty
    status: integer('status').default(0).notNull(),

    is_shared: integer('is_shared', { mode: 'boolean' }).default(true),
    is_memo_only: integer('is_memo_only', { mode: 'boolean' }).default(false),
    should_buy: integer('should_buy', { mode: 'boolean' }).default(true), // If false, never verify for shopping list even if empty

    owner_id: text('owner_id'), // if not shared, who owns it
    group_id: text('group_id'), // which group it belongs to

    updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    updated_by: text('updated_by'), // username of last updater
});

export const sessions = sqliteTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    expiresAt: integer('expires_at').notNull(),
});
