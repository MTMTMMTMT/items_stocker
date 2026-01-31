'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// We need to mirror the Item type or import it
type Item = {
    id: string;
    name: string;
    status: number;
    category: string | null;
    memo: string | null;
    is_memo_only: boolean | null;
    is_shared: boolean | null;
    should_buy: boolean | null;
};

interface EditItemDialogProps {
    item: Item | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (id: string, name: string, memo: string | null, category: string | null, is_shared: boolean) => void;
    existingCategories: string[];
}

export function EditItemDialog({ item, open, onOpenChange, onSubmit, existingCategories }: EditItemDialogProps) {
    const [name, setName] = useState("");
    const [memo, setMemo] = useState("");
    const [category, setCategory] = useState("");
    const [isShared, setIsShared] = useState(true);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setMemo(item.memo || "");
            setCategory(item.category || "");
            setIsShared(item.is_shared !== false); // Default logic
        }
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;
        onSubmit(item.id, name, memo || null, category || null, isShared);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>アイテムを編集</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">商品名</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="商品名"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-category">カテゴリー</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {existingCategories.map((cat) => (
                                <Badge
                                    key={cat}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-secondary"
                                    onClick={() => setCategory(cat)}
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                        <Input
                            id="edit-category"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            placeholder="カテゴリー"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-memo">メモ</Label>
                        <Textarea
                            id="edit-memo"
                            value={memo}
                            onChange={e => setMemo(e.target.value)}
                            placeholder="備考や詳細"
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="edit-is-shared"
                            checked={isShared}
                            onCheckedChange={(c) => setIsShared(!!c)}
                        />
                        <Label htmlFor="edit-is-shared">家族と共有する</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            キャンセル
                        </Button>
                        <Button type="submit">保存</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
