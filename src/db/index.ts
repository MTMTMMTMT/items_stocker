import 'server-only';
import { drizzle } from 'drizzle-orm/d1';
import { getRequestContext } from '@cloudflare/next-on-pages';
import * as schema from './schema';

export interface Env {
    DB: D1Database;
}

// Helper to get DB instance from environment binding
// In Next.js App Router (Cloudflare Pages), we often get context via middleware or request
// But for now, we'll assume we can get it from the request context or global process.env in some setups.
// Note: Direct access to `process.env.DB` isn't how D1 works in Pages Functions usually.
// We'll likely pass the DB instance from the Server Action context.

// For local dev with `wrangler dev` or `next-on-pages`, we need to handle binding differently.
// For now, type definition only. actual initialization happens where we have access to the binding.

export const createDb = (d1: D1Database) => {
    return drizzle(d1);
};

export const getDb = async () => {
    // In local dev (next dev), we might not have getRequestContext working perfectly without setup,
    // but for Cloudflare Pages it's the way.
    // Fallback or handling for local 'npm run dev' vs 'wrangler pages dev' is needed.
    // For now, assume we run via 'wrangler pages dev' or have bindings.

    let dbBinding: D1Database;

    try {
        const ctx = getRequestContext();
        dbBinding = (ctx.env as unknown as Env).DB;
    } catch (e) {
        // Fallback for local dev if not running with bindings (e.g. standard next dev)
        // ideally we use wrangler to invoke next.
        // Or we can just throw if DB is missing.
        console.warn("Could not get D1 binding from context, verify execution environment.");
        throw new Error("D1 binding not found");
    }

    return drizzle(dbBinding, { schema });
};
