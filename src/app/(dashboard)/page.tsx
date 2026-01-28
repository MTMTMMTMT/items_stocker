
import { getDb } from '@/db';
import { items, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ItemList } from '@/components/item-list';
import { AddItemDrawer } from '@/components/add-item-drawer';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/actions';

export default async function DashboardPage() {
    const user = await getSession();
    if (!user) {
        redirect('/login');
    }

    const db = await getDb();

    // Fetch Items for user's group
    // user.groupId might be null in schema? Check schema.
    // schema: group_id: text('group_id')

    let userItems: any[] = []; // Fix type

    if (user.group_id) {
        userItems = await db.select().from(items).where(eq(items.group_id, user.group_id)).all();
    } else {
        // If no group, just own items? or strict group policy?
        // Start with owner_id
        userItems = await db.select().from(items).where(eq(items.owner_id, user.id)).all();
    }

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between py-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <h1 className="text-2xl font-bold tracking-tight">
                    My Stock
                </h1>
                <form action={logoutAction}>
                    <Button variant="ghost" size="icon">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </form>
            </header>

            <ItemList initialItems={userItems} />

            <AddItemDrawer />
        </div>
    );
}
