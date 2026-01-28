'use client';

import { useActionState, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// import { addItemAction } from '@/lib/actions'; // To be implemented

// Mock action for now or I'll implement it in actions.ts next
import { addItemAction } from '@/lib/actions';

interface ActionState {
    error?: string;
    success?: boolean;
}

const initialState: ActionState = {
    error: '',
    success: false,
};

export function AddItemDrawer() {
    const [open, setOpen] = useState(false);
    const [state, action, isPending] = useActionState(addItemAction, initialState);

    // Close drawer on success
    if (state?.success && open) {
        setOpen(false);
        // Reset state? useActionState doesn't verify reset easily, but component re-mounts or we can useEffect.
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50"
                    size="icon"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Add New Item</DrawerTitle>
                        <DrawerDescription>Add a new item to your stock or shopping list.</DrawerDescription>
                    </DrawerHeader>
                    <form action={action} className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Item Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Milk" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" name="category" placeholder="e.g. Dairy" />
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Checkbox handling in server actions requires 'on' value check */}
                            <Checkbox id="is_memo_only" name="is_memo_only" value="true" />
                            <Label htmlFor="is_memo_only">One-time purchase (don&apos;t track stock)</Label>
                        </div>

                        <DrawerFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Adding...' : 'Add Item'}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
