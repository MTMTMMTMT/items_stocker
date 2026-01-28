'use client';

import { useOptimistic, startTransition, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toggleItemStatusAction, checkItemAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

type Item = {
    id: string;
    name: string;
    status: number; // 0: Plenty, 1: Low, 2: Empty
    category: string | null;
    memo: string | null;
    is_memo_only: boolean | null;
    is_shared: boolean | null;
};

// Status Utils
const STATUS_COLORS = {
    0: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200',
    1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200',
    2: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200',
};
const STATUS_LABELS = { 0: '在庫あり', 1: '少なめ', 2: 'なし' };

export function ItemList({ initialItems }: { initialItems: Item[] }) {
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'stock';

    const [filteredCategory, setFilteredCategory] = useState<string | null>(null);

    const [optimisticItems, setOptimisticItems] = useOptimistic(
        initialItems,
        (state, action: { type: 'updateStatus' | 'checkItem'; itemId: string; newStatus?: number }) => {
            switch (action.type) {
                case 'updateStatus':
                    return state.map(item =>
                        item.id === action.itemId
                            ? { ...item, status: action.newStatus! }
                            : item
                    );
                case 'checkItem':
                    return state.map(item =>
                        item.id === action.itemId
                            ? { ...item, status: 0 }
                            : item
                    );
                default:
                    return state;
            }
        }
    );

    // Filter keys logic
    const displayedItems = optimisticItems.filter(item => {
        // 1. View Mode Filter
        if (view === 'shopping') {
            // Shopping view: Show if status is Low(1) or Empty(2), OR if it's memo_only (assuming memo_only implies shopping list usage)
            // BUT: if memo_only item is checked (status 0), it should disappear? 
            // Current Logic: 
            // Status 0 (Plenty) -> Hidden usually.
            // If item.is_memo_only is true, and status is 0... usage implies "Bought". So hide.
            if (item.status === 0) return false;
            return true;
        } else {
            // Stock mode: Show all tracked items (not memo_only)
            if (item.is_memo_only) return false;
            return true;
        }
    });

    // 2. Category Filter
    const finalFilteredItems = filteredCategory
        ? displayedItems.filter(item => (item.category || '未分類') === filteredCategory)
        : displayedItems;

    // Get all unique categories from the current view's items (or all items? usually better to show all available categories in the global list)
    // Actually, let's show categories present in the *current view mode* to avoid empty filters, OR all categories.
    // Let's us all initialItems categories for the filter strip.
    const allCategories = Array.from(new Set(initialItems.map(i => i.category || '未分類')));

    const grouped = finalFilteredItems.reduce((acc, item) => {
        const cat = item.category || '未分類';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, Item[]>);

    const handleStatusToggle = (item: Item) => {
        const nextStatus = (item.status + 1) % 3;
        startTransition(() => {
            setOptimisticItems({ type: 'updateStatus', itemId: item.id, newStatus: nextStatus });
            toggleItemStatusAction(item.id, item.status);
        });
    };

    const handleCheckLine = (item: Item) => {
        startTransition(() => {
            setOptimisticItems({ type: 'checkItem', itemId: item.id });
            checkItemAction(item.id);
        });
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Category Filter Strip */}
            <div className="sticky top-[4rem] z-10 bg-background/95 backdrop-blur py-2 -mx-4 px-4 overflow-x-auto no-scrollbar border-b">
                <div className="flex gap-2">
                    <Badge
                        variant={filteredCategory === null ? "default" : "outline"}
                        className="cursor-pointer whitespace-nowrap"
                        onClick={() => setFilteredCategory(null)}
                    >
                        すべて
                    </Badge>
                    {allCategories.map(cat => (
                        <Badge
                            key={cat}
                            variant={filteredCategory === cat ? "default" : "outline"}
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => setFilteredCategory(cat)}
                        >
                            {cat}
                        </Badge>
                    ))}
                </div>
            </div>

            {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
                        {category}
                    </h3>
                    <div className="space-y-2">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border border-border/50"
                            >
                                <div className="flex-1 min-w-0 mr-2">
                                    <div className="font-medium text-[16px] truncate">{item.name}</div>
                                    {item.memo && <div className="text-xs text-muted-foreground truncate">{item.memo}</div>}
                                    {item.is_shared === false && <Badge variant="outline" className="text-[10px] h-4 px-1 mt-1 text-muted-foreground">自分のみ</Badge>}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {view === 'shopping' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-12 w-12 p-0 rounded-full border-green-500 text-green-500 hover:bg-green-50"
                                            onClick={() => handleCheckLine(item)}
                                        >
                                            <Check className="h-6 w-6" />
                                        </Button>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "cursor-pointer px-3 py-1.5 text-xs font-semibold select-none transition-colors",
                                                STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]
                                            )}
                                            onClick={() => handleStatusToggle(item)}
                                        >
                                            {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || 'Unknown'}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {finalFilteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50 space-y-2">
                    <Check className="h-10 w-10" />
                    <p>{view === 'shopping' ? '買い物リストは空です！' : 'アイテムが見つかりません'}</p>
                </div>
            )}
        </div>
    );
}
