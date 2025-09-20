// components/ReturnDialog.tsx
'use client';

import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReturnDialogProps {
    open: boolean;
    onClose: () => void;
    orderItems: Array<{
        id: string; // <-- ensure each order item has a unique id
        product: { id: string; name: string };
        quantity: number;
        numberOfDays: number;
        rentRate: number;
    }>;
    onSubmit: (returns: { productId: string; quantity: number; orderItemId: string }[]) => void;
}

export function ReturnDialog({ open, onClose, orderItems, onSubmit }: ReturnDialogProps) {
    // key by ORDER ITEM id (unique per row), not product id
    const [returnQtyByItemId, setReturnQtyByItemId] = useState<Record<string, number>>({});

    const handleChange = (orderItemId: string, value: string) => {
        const num = Math.max(0, parseInt(value, 10) || 0); // clamp >= 0
        setReturnQtyByItemId(prev => ({ ...prev, [orderItemId]: num }));
    };

    const handleSubmit = () => {
        // validate per item
        for (const item of orderItems) {
            const entered = returnQtyByItemId[item.id] ?? 0;
            if (entered > item.quantity) {
                alert(`Return qty for ${item.product.name} cannot exceed ordered qty (${item.quantity})`);
                return;
            }
        }

        const returns = orderItems.map(item => ({
            orderItemId: item.id,
            productId: item.product.id,
            quantity: returnQtyByItemId[item.id] ?? 0,
        }));

        onSubmit(returns);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Return Items</DialogTitle>
                </DialogHeader>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Ordered</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead>Return Qty</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orderItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.numberOfDays}</TableCell>
                                <TableCell>₹{item.rentRate}</TableCell>
                                <TableCell>
                                    ₹{(item.quantity * item.rentRate * item.numberOfDays).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={item.quantity}
                                        value={
                                            // keep controlled; show '' instead of 0 until user types
                                            returnQtyByItemId[item.id] === undefined
                                                ? ''
                                                : String(returnQtyByItemId[item.id])
                                        }
                                        onChange={(e) => handleChange(item.id, e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
