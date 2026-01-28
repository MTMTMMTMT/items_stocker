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
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome Back</CardTitle>
                            <CardDescription>Enter your credentials to access your stock.</CardDescription>
                        </CardHeader>
                        <form action={formLoginAction}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" name="username" placeholder="Enter username" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" placeholder="Enter password" required />
                                </div>
                                {loginState?.error && (
                                    <p className="text-sm text-red-500">{loginState.error}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isLoginPending}>
                                    {isLoginPending ? 'Logging in...' : 'Login'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Account</CardTitle>
                            <CardDescription>Start managing your household items today.</CardDescription>
                        </CardHeader>
                        <form action={formRegisterAction}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-username">Username</Label>
                                    <Input id="reg-username" name="username" placeholder="Choose a username" required minLength={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Password</Label>
                                    <Input id="reg-password" name="password" type="password" placeholder="Choose a password" required minLength={6} />
                                </div>
                                {registerState?.error && (
                                    <p className="text-sm text-red-500">{registerState.error}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isRegisterPending}>
                                    {isRegisterPending ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
