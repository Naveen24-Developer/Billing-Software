
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import type { Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be a positive number'),
  rate: z.coerce.number().min(0, 'Rate must be a positive number'),
  rate_unit: z.enum(['day', 'hour', 'month']),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormDialogProps {
  product?: Product | null;
  onSave: (product: Omit<Product, 'id'>, id?: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function ProductFormDialog({
  product,
  onSave,
  open,
  onOpenChange,
  children,
}: ProductFormDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      rate: 0,
      rate_unit: 'day',
    },
  });

  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          name: product.name,
          quantity: product.quantity,
          rate: product.rate,
          rate_unit: product.rate_unit,
        });
      } else {
        form.reset({
          name: '',
          quantity: 0,
          rate: 0,
          rate_unit: 'day',
        });
      }
    }
  }, [product, open, form]);

  const onSubmit = (values: ProductFormValues) => {
    onSave(values, product?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent Price *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="rate_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="day">per day</SelectItem>
                        <SelectItem value="hour">per hour</SelectItem>
                        <SelectItem value="month">per month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <DialogFooter className='pt-4'>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
