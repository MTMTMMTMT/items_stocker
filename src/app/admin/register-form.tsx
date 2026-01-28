'use client';

import { useActionState } from 'react';
import { registerAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState = {
    error: '',
    success: false,
};

export function AdminRegisterForm() {
    const [state, action, isPending] = useActionState(registerAction, initialState);

    return (
        <form action={action} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="group_id">家族ID</Label>
                <Input id="group_id" name="group_id" placeholder="家族ID" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="username">ユーザー名</Label>
                <Input id="username" name="username" placeholder="ユーザー名" required minLength={3} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input id="password" name="password" type="password" placeholder="パスワード" required minLength={6} />
            </div>

            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-500">登録しました</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? '登録中...' : '登録する'}
            </Button>
        </form>
    );
}
