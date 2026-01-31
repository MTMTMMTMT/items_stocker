'use client';

import { startTransition, useOptimistic, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Circle, MoreHorizontal, Pencil, Trash, ShoppingCart } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toggleItemStatusAction, checkItemAction, deleteItemAction, toggleShouldBuyAction, updateItemAction } from '@/lib/actions';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditItemDialog } from './edit-item-dialog';

type Item = {
    id: string;
    name: string;
    status: number; // 0: Plenty, 1: Low, 2: Empty
    category: string | null;
    memo: string | null;
    is_memo_only: boolean | null;
    is_shared: boolean | null;
    should_buy: boolean | null;
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
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    const [optimisticItems, setOptimisticItems] = useOptimistic(
        initialItems,
        (state, action: {
            type: 'updateStatus' | 'checkItem' | 'deleteItem' | 'toggleShouldBuy' | 'updateItemFull';
            itemId: string;
            newStatus?: number;
            newShouldBuy?: boolean;
            newName?: string;
            newMemo?: string | null;
            newCategory?: string | null;
            newIsShared?: boolean;
            newIsMemoOnly?: boolean;
        }) => {
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
                case 'deleteItem':
                    return state.filter(item => item.id !== action.itemId);
                case 'toggleShouldBuy':
                    return state.map(item =>
                        item.id === action.itemId
                            ? { ...item, should_buy: action.newShouldBuy! }
                            : item
                    );
                case 'updateItemFull':
                    return state.map(item =>
                        item.id === action.itemId
                            ? {
                                ...item,
                                name: action.newName!,
                                memo: action.newMemo!,
                                category: action.newCategory!,
                                is_shared: action.newIsShared!,
                                is_memo_only: action.newIsMemoOnly!
                            }
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
            if (item.status === 0) return false;
            // Hide if stop repurchasing is active (should_buy is false)
            if (item.should_buy === false) return false;
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

    const allCategories = Array.from(new Set(displayedItems.map(i => i.category || '未分類')));

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
            if (item.is_memo_only) {
                setOptimisticItems({ type: 'deleteItem', itemId: item.id });
            } else {
                setOptimisticItems({ type: 'checkItem', itemId: item.id });
            }
            checkItemAction(item.id);
        });
    };

    const handleDelete = (item: Item) => {
        if (!confirm('本当に削除しますか？')) return;
        startTransition(() => {
            setOptimisticItems({ type: 'deleteItem', itemId: item.id });
            deleteItemAction(item.id);
        });
    };

    const handleToggleShouldBuy = (item: Item) => {
        const current = item.should_buy !== false;
        startTransition(() => {
            setOptimisticItems({ type: 'toggleShouldBuy', itemId: item.id, newShouldBuy: !current });
            toggleShouldBuyAction(item.id, current);
        });
    };

    const handleUpdateItem = (id: string, name: string, memo: string | null, category: string | null, is_shared: boolean, is_memo_only: boolean) => {
        startTransition(() => {
            setOptimisticItems({
                type: 'updateItemFull',
                itemId: id,
                newName: name,
                newMemo: memo,
                newCategory: category,
                newIsShared: is_shared,
                newIsMemoOnly: is_memo_only
            });
            updateItemAction(id, name, memo, category, is_shared, is_memo_only);
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
                                className={cn(
                                    "flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border border-border/50 transition-opacity",
                                    item.should_buy === false && "opacity-60 grayscale"
                                )}
                            >
                                <div className="flex items-center flex-1 min-w-0 mr-2 gap-2">
                                    <div className="min-w-0">
                                        <div className={cn("font-medium text-[16px] truncate", item.should_buy === false && "line-through decoration-muted-foreground")}>
                                            {item.name}
                                        </div>
                                        {item.memo && <div className="text-xs text-muted-foreground truncate">{item.memo}</div>}
                                    </div>
                                    <div className="flex gap-1 flex-wrap shrink-0">
                                        {item.should_buy === false && <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground border-dashed">停止中</Badge>}
                                        {item.is_shared === false && <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground">自分のみ</Badge>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {view === 'shopping' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-12 w-12 p-0 rounded-full border-muted-foreground text-muted-foreground hover:bg-green-50 hover:text-green-500 hover:border-green-500"
                                            onClick={() => handleCheckLine(item)}
                                        >
                                            <ShoppingCart className="h-5 w-5" />
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

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingItem(item)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                編集
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleShouldBuy(item)}>
                                                {item.should_buy !== false ? '購入を一時停止' : '購入を再開'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-600 focus:text-red-600">
                                                <Trash className="mr-2 h-4 w-4" />
                                                削除
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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

            <EditItemDialog
                open={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
                item={editingItem}
                existingCategories={Array.from(new Set(initialItems.map(i => i.category || '未分類')))}
                onSubmit={handleUpdateItem}
            />
        </div>
    );
}
