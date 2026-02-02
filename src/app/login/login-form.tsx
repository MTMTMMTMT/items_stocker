'use client';
import { useActionState, useState } from 'react';
import { loginAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Initial state for useActionState
const initialState = {
    error: '',
};

export function LoginForm() {
    const [loginState, formLoginAction, isLoginPending] = useActionState(loginAction, initialState);

    return (
        <div className="w-full max-w-md p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>おかえりなさい</CardTitle>
                    <CardDescription>在庫管理アプリへようこそ。</CardDescription>
                </CardHeader>
                <form action={formLoginAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="group_id">家族ID</Label>
                            <Input id="group_id" name="group_id" placeholder="家族IDを入力" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">ユーザー名</Label>
                            <Input id="username" name="username" placeholder="ユーザー名を入力" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">パスワード</Label>
                            <Input id="password" name="password" type="password" placeholder="パスワードを入力" required />
                        </div>
                        {loginState?.error && (
                            <p className="text-sm text-red-500">{loginState.error}</p>
                        )}
                    </CardContent>
                    <CardFooter className="pt-4">
                        <Button type="submit" className="w-full" disabled={isLoginPending}>
                            {isLoginPending ? 'ログイン中...' : 'ログイン'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2 font-medium">デモアカウントで体験</p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-xs inline-block text-left border w-full">
                    <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
                        <span>家族ID:</span>
                        <span className="font-mono font-medium">family-demo</span>
                        <span>ユーザー名:</span>
                        <span className="font-mono font-medium">demo</span>
                        <span>パスワード:</span>
                        <span className="font-mono font-medium">demo1234</span>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                            e.preventDefault();
                            (document.getElementById('group_id') as HTMLInputElement).value = 'family-demo';
                            (document.getElementById('username') as HTMLInputElement).value = 'demo';
                            (document.getElementById('password') as HTMLInputElement).value = 'demo1234';
                        }}
                    >
                        自動入力する
                    </Button>
                </div>
            </div>
        </div>
    );
}
