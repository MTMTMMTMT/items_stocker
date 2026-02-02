'use client';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { deleteUserAction } from '@/lib/actions';
import { useTransition } from 'react';

export function UserDeleteButton({ userId }: { userId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm('本当に削除しますか？この操作は取り消せません。')) return;

        startTransition(async () => {
            try {
                const result = await deleteUserAction(userId);
                if (result && result.error) {
                    alert(result.error);
                }
            } catch (e) {
                alert('削除中にエラーが発生しました');
                console.error(e);
            }
        });
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
            <Trash className="h-4 w-4" />
        </Button>
    );
}
