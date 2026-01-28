'use client';

import { useActionState, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// import { addItemAction } from '@/lib/actions'; // To be implemented

// Mock action for now or I'll implement it in actions.ts next
import { addItemAction } from '@/lib/actions';

interface ActionState {
    error?: string;
    success?: boolean;
}

const initialState: ActionState = {
    error: '',
    success: false,
};

export function AddItemDrawer({ existingCategories = [] }: { existingCategories?: string[] }) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        const formData = new FormData(e.currentTarget);

        // Add item
        const result = await addItemAction(null, formData);

        if (result?.success) {
            setOpen(false);
            // Optional: Show toast here if sounder is set up
        } else {
            // Handle error if needed
            console.error(result?.error);
        }
        setIsPending(false);
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
                    size="icon"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>アイテムを追加</DrawerTitle>
                        <DrawerDescription>在庫や買い物リストに新しいアイテムを追加します。</DrawerDescription>
                    </DrawerHeader>
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">商品名</Label>
                            <Input id="name" name="name" placeholder="例: 牛乳" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">カテゴリー</Label>
                            <Input
                                id="category"
                                name="category"
                                placeholder="例: 食品"
                                list="category-list"
                                autoComplete="off"
                            />
                            <datalist id="category-list">
                                {existingCategories.map((cat, i) => (
                                    <option key={i} value={cat} />
                                ))}
                            </datalist>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="memo">メモ</Label>
                            <Input id="memo" name="memo" placeholder="備考や詳細（任意）" />
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Checkbox handling in server actions requires 'on' value check */}
                            <Checkbox id="is_memo_only" name="is_memo_only" value="true" />
                            <Label htmlFor="is_memo_only">メモのみ（在庫管理しない）</Label>
                        </div>

                        <DrawerFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? '追加中...' : '追加'}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline">キャンセル</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
