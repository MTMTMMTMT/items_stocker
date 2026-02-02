
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AdminRegisterForm } from './register-form';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { deleteUserAction } from '@/lib/actions';

export const runtime = 'edge';

export default async function AdminPage() {
    const db = await getDb();
    const allUsers = await db.select().from(users).all();

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">管理画面</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>ユーザー一覧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ユーザー名</TableHead>
                                    <TableHead>家族ID</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.group_id}</TableCell>
                                        <TableCell>
                                            <form action={async () => {
                                                'use server';
                                                await deleteUserAction(user.id);
                                            }}>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>新規ユーザー登録</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AdminRegisterForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
