
import { getDb } from '@/db';
import { items } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ItemList } from '@/components/item-list';
import { AddItemDrawer } from '@/components/add-item-drawer';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/actions';

export const runtime = 'edge';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const db = await getDb();

  let userItems: any[] = [];

  if (user.group_id) {
    userItems = await db.select().from(items).where(eq(items.group_id, user.group_id)).all();
  } else {
    userItems = await db.select().from(items).where(eq(items.owner_id, user.id)).all();
  }

  // Extract unique categories from items
  // Exclude "Zombie" items (Memo Only items that are bought/checked, i.e., status === 0)
  const activeItems = userItems.filter(item => {
    if (item.is_memo_only && item.status === 0) return false;
    return true;
  });
  const uniqueCategories = Array.from(new Set(activeItems.map(item => item.category).filter(Boolean))) as string[];

  return (
    <div className="space-y-4 pb-24"> {/* Added padding for bottom nav */}
      <header className="flex items-center justify-center py-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 px-4 mt-2 rounded-xl border-b">
        <h1 className="text-xl font-bold tracking-tight">
          Items Stocker
        </h1>
      </header>

      <div className="px-4">
        <ItemList initialItems={userItems} />
      </div>

      <AddItemDrawer existingCategories={uniqueCategories} />
    </div>
  );
}
