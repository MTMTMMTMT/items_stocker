'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePasswordAction } from '@/lib/actions';
import { Lock } from 'lucide-react';

const initialState = {
    success: false,
    message: '',
    error: '',
};

export function ChangePasswordForm() {
    const [state, action, isPending] = useActionState(changePasswordAction, initialState);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">パスワード変更</CardTitle>
                <CardDescription>
                    パスワードを変更します。現在のパスワードがわからない場合は開発者に連絡してください。
                </CardDescription>
            </CardHeader>
            <form action={action}>
                <CardContent className="space-y-4">
                    {state?.error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                            {state.error}
                        </div>
                    )}
                    {state?.message && (
                        <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md">
                            {state.message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">現在のパスワード</Label>
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">新しいパスワード</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            minLength={6}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            minLength={6}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="pt-6">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? '変更中...' : 'パスワードを変更'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
