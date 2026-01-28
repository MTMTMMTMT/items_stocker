'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Home, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'stock';

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md pb-safe">
            <div className="flex justify-around items-center h-16">
                <Link
                    href="/?view=stock"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        view === 'stock' ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <Home className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Stock</span>
                </Link>

                <Link
                    href="/?view=shopping"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        view === 'shopping' ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Shopping</span>
                </Link>

                {/* Placeholder for settings or family switch if not in header */}
                <Link
                    href="/settings"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1",
                        "text-muted-foreground" // Settings always distinct or active?
                    )}
                >
                    <User className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Account</span>
                </Link>
            </div>
        </div>
    );
}
