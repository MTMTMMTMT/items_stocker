'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';

export function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showNav = pathname !== '/login';

    return (
        <>
            <main className="container max-w-md mx-auto min-h-screen bg-background relative">
                {children}
            </main>
            {showNav && <BottomNav />}
        </>
    );
}
