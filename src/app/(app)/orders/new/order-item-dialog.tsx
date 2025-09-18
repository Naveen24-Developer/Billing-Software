
'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/lib/types';

const orderItemFormSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  productRate: z.coerce.number(),
  rentRate: z.coerce.number().min(0, "Rent rate can't be negative"),
  numberOfDays: z.coerce.number().min(1, 'Number of days must be at least 1'),
});

export type OrderItemFormValues = z.infer<typeof orderItemFormSchema>;

interface OrderItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: OrderItemFormValues) => void;
  products: Product[];
  item?: OrderItemFormValues | null;
}

export default function OrderItemDialog({ isOpen, onOpenChange, onSave, products, item }: OrderItemDialogProps) {
  const form = useForm<OrderItemFormValues>({
    resolver: zodResolver(orderItemFormSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
      productRate: 0,
      rentRate: 0,
      numberOfDays: 1,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset(item);
      } else {
        form.reset({
          productId: '',
          quantity: 1,
          productRate: 0,
          rentRate: 0,
          numberOfDays: 1,
        });
      }
    }
  }, [isOpen, item, form]);

  const onSubmit = (data: OrderItemFormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-rows-4 gap-4">
              <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const product = products.find((p) => p.id === value);
                      field.onChange(value);
                      form.setValue('productRate', product?.rate || 0);
                      form.setValue('rentRate', product?.rate || 0);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rentRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent Rate *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="numberOfDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{item ? 'Save Changes' : 'Add Item'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
