
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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Customer } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  aadhar: z.string().optional(),
  referredBy: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormDialogProps {
  customer?: Customer | null;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt'>, id?: string) => void;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerFormDialog({
  customer,
  onSave,
  children,
  open,
  onOpenChange,
}: CustomerFormDialogProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      aadhar: '',
      referredBy: '',
    },
  });

  useEffect(() => {
    if (customer && open) {
      form.reset({
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        aadhar: customer.aadhar || '',
        referredBy: customer.referredBy || '',
      });
    } else if (!customer && open) {
      form.reset({
        name: '',
        phone: '',
        address: '',
        aadhar: '',
        referredBy: '',
      });
    }
  }, [customer, open, form]);

  const onSubmit = (values: CustomerFormValues) => {
    onSave(values, customer?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aadhar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhar</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referred By</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className='pt-4'>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Customer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
