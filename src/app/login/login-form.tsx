'use client';

import { useActionState, useState } from 'react';
import { loginAction, registerAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Initial state for useActionState
const initialState = {
    error: '',
};

export function LoginForm() {
    // Separate states for login and register to avoid mixed state issues if needed, 
    // but useActionState hooks are separate.
    const [loginState, formLoginAction, isLoginPending] = useActionState(loginAction, initialState);
    const [registerState, formRegisterAction, isRegisterPending] = useActionState(registerAction, initialState);

    return (
        <div className="w-full max-w-md p-4">
            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">ログイン</TabsTrigger>
                    <TabsTrigger value="register">新規登録</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>おかえりなさい</CardTitle>
                            <CardDescription>在庫管理アプリへようこそ。</CardDescription>
                        </CardHeader>
                        <form action={formLoginAction}>
                            <CardContent className="space-y-4">
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
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isLoginPending}>
                                    {isLoginPending ? 'ログイン中...' : 'ログイン'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle>アカウント作成</CardTitle>
                            <CardDescription>新しく在庫管理を始めましょう。</CardDescription>
                        </CardHeader>
                        <form action={formRegisterAction}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-username">ユーザー名</Label>
                                    <Input id="reg-username" name="username" placeholder="ユーザー名を決めてください" required minLength={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">パスワード</Label>
                                    <Input id="reg-password" name="password" type="password" placeholder="パスワードを決めてください" required minLength={6} />
                                </div>
                                {registerState?.error && (
                                    <p className="text-sm text-red-500">{registerState.error}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isRegisterPending}>
                                    {isRegisterPending ? '作成中...' : 'アカウント作成'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
