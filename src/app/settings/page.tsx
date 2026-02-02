import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/actions';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { ChevronLeft, LogOut } from 'lucide-react';
import { ChangePasswordForm } from './change-password-form';

export const runtime = 'edge';

export default async function SettingsPage() {
    const user = await getSession();

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="flex items-center p-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <Button variant="ghost" size="icon" asChild className="-ml-2 mr-2">
                    <Link href="/">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">設定</h1>
            </header>

            <div className="p-4 space-y-8">
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        アカウント
                    </h2>
                    <div className="bg-card rounded-xl border p-4 shadow-sm space-y-4">
                        <div className="flex justify-between items-center py-2 border-b last:border-0 last:pb-0">
                            <span className="text-sm font-medium">ユーザー名</span>
                            <span className="text-sm text-muted-foreground">{user?.username}</span>
                        </div>
                        {/* <div className="flex justify-between items-center py-2 border-b last:border-0">
                            <span className="text-sm font-medium">グループID</span>
                            <span className="text-sm text-muted-foreground font-mono">{user?.group_id || 'None'}</span>
                        </div> */}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        セキュリティ
                    </h2>
                    <ChangePasswordForm />
                </section>

                <section className="space-y-4">
                    <form action={logoutAction} className="w-full">
                        <Button variant="destructive" className="w-full justify-start space-x-2" size="lg">
                            <LogOut className="h-5 w-5" />
                            <span>ログアウト</span>
                        </Button>
                    </form>
                </section>

                <div className="text-center text-xs text-muted-foreground pt-8">
                    Items Stocker v1.0.0
                </div>
            </div >
        </div >
    );
}
