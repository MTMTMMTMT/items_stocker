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
import { Badge } from '@/components/ui/badge';
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
    const [isMemoOnly, setIsMemoOnly] = useState(false);

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
                <div className="mx-auto w-full max-w-sm max-h-[85vh] overflow-y-auto">
                    <DrawerHeader>
                        <DrawerTitle>アイテムを追加</DrawerTitle>
                        <DrawerDescription>在庫や買い物リストに新しいアイテムを追加します。</DrawerDescription>
                    </DrawerHeader>
                    <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-48">
                        <div className="space-y-2">
                            <Label htmlFor="name">商品名</Label>
                            <Input id="name" name="name" placeholder="例: 醤油" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">カテゴリー</Label>
                            {/* Quick Select Badges */}
                            <div className="flex flex-wrap gap-2 mb-2">
                                {existingCategories.map((cat) => (
                                    <Badge
                                        key={cat}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-secondary"
                                        onClick={() => {
                                            const input = document.getElementById('category') as HTMLInputElement;
                                            if (input) input.value = cat;
                                        }}
                                    >
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                            <Input
                                id="category"
                                name="category"
                                placeholder="例: 調味料 (または上のタグを選択)"
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="memo">メモ</Label>
                            <Input id="memo" name="memo" placeholder="備考や詳細（任意）" />
                        </div>
                        <div className="space-y-2">
                            <Label>アイテムの種類</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={!isMemoOnly ? "default" : "outline"}
                                    className="flex-1"
                                    onClick={() => setIsMemoOnly(false)}
                                >
                                    在庫管理に追加
                                </Button>
                                <Button
                                    type="button"
                                    variant={isMemoOnly ? "default" : "outline"}
                                    className="flex-1"
                                    onClick={() => setIsMemoOnly(true)}
                                >
                                    買い物リストに追加
                                </Button>
                            </div>
                            <input type="hidden" name="is_memo_only" value={isMemoOnly ? "true" : "false"} />
                            <p className="text-[10px] text-muted-foreground">
                                {!isMemoOnly
                                    ? "在庫として管理します。在庫がなくなったら自動で「買い物リスト」に入ります。"
                                    : "今回だけの買い物メモです。購入チェックをするとリストから消えます。"}
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_shared" name="is_shared" defaultChecked={true} value="true" />
                            <Label htmlFor="is_shared">家族と共有する</Label>
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
            </DrawerContent >
        </Drawer >
    );
}
