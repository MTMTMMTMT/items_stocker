'use client';

import { useOptimistic, startTransition } from 'react';
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
                    // In shopping view, checking usually removes it (updated to status 0)
                    // We can remove it from list or update status
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

    // Filter keys logic moved here to use optimisticItems
    const filteredItems = optimisticItems.filter(item => {
        // If shopping mode, show low/empty/memo
        if (view === 'shopping') {
            if (item.status === 0 && !item.is_memo_only) return false; // Plenty standard items hidden
            // If it was just checked (status 0), we might want to hide it immediately
            // But if it's memo_only, does status 0 mean hidden? 
            // Requirement: "チェックを入れると即座に Plenty に戻る" -> "disappear from list"
            // If status is 0, it disappears.
            if (item.status === 0) return false;
            return true;
        }
        // Stock mode: Show non-memo items
        return !item.is_memo_only;
    });

    const grouped = filteredItems.reduce((acc, item) => {
        const cat = item.category || '未分類';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, Item[]>);

    const handleStatusToggle = (item: Item) => {
        const nextStatus = (item.status + 1) % 3;
        startTransition(() => {
            setOptimisticItems({ type: 'updateStatus', itemId: item.id, newStatus: nextStatus });
            toggleItemStatusAction(item.id, item.status); // Action triggers revalidate
        });
    };

    const handleCheckLine = (item: Item) => {
        startTransition(() => {
            setOptimisticItems({ type: 'checkItem', itemId: item.id });
            checkItemAction(item.id);
        });
    };

    return (
        <div className="space-y-6 pb-20">
            {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-[4rem] bg-background/95 backdrop-blur z-9 py-2">
                        {category}
                    </h3>
                    <div className="space-y-2">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border border-border/50"
                            >
                                <div>
                                    <div className="font-medium text-[16px]">{item.name}</div> {/* Thumb friendly text size */}
                                    {item.memo && <div className="text-xs text-muted-foreground">{item.memo}</div>}
                                </div>

                                <div className="flex items-center gap-2">
                                    {view === 'shopping' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-10 w-10 p-0 rounded-full border-green-500 text-green-500 hover:bg-green-50"
                                            onClick={() => handleCheckLine(item)}
                                        >
                                            <Check className="h-5 w-5" />
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

            {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50 space-y-2">
                    <Check className="h-10 w-10" />
                    <p>{view === 'shopping' ? '買い物リストは空です！' : 'アイテムが登録されていません。'}</p>
                </div>
            )}
        </div>
    );
}
