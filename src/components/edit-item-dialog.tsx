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
    onSubmit: (id: string, name: string, memo: string | null) => void;
}

export function EditItemDialog({ item, open, onOpenChange, onSubmit }: EditItemDialogProps) {
    const [name, setName] = useState("");
    const [memo, setMemo] = useState("");

    useEffect(() => {
        if (item) {
            setName(item.name);
            setMemo(item.memo || "");
        }
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;
        onSubmit(item.id, name, memo || null);
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
                        <Label htmlFor="edit-memo">メモ</Label>
                        <Textarea
                            id="edit-memo"
                            value={memo}
                            onChange={e => setMemo(e.target.value)}
                            placeholder="備考や詳細"
                            className="resize-none"
                            rows={4}
                        />
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
