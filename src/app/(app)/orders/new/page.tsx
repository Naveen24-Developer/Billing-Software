
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { mockProducts, mockVehicles, mockOrders } from '@/lib/data';
import type { Customer, Product, Order, PriceDetails, OrderItem } from '@/lib/types';
import CustomerFormDialog from '@/app/(app)/customers/customer-form-dialog';
import { Switch } from '@/components/ui/switch';
import { useCustomers } from '@/contexts/customer-context';
import OrderItemDialog from './order-item-dialog';
import type { OrderItemFormValues } from './order-item-dialog';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  productRate: z.coerce.number(),
  rentRate: z.coerce.number().min(0, "Rent rate can't be negative"),
  numberOfDays: z.coerce.number().min(1, 'Number of days must be at least 1'),
});

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  pickupRequired: z.boolean(),
  vehicleId: z.string().optional(),
  remarks: z.string().optional(),
  discountType: z.enum(['fixed', 'percentage']).optional(),
  discountValue: z.coerce.number().optional(),
  deliveryCharge: z.coerce.number().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  initialPaid: z.coerce.number().optional(),
});

type OrderFormValues = z.infer<typeof formSchema>;

export default function CreateOrderPage() {
  const { customers, addCustomer } = useCustomers();
  const [products] = useState<Product[]>(mockProducts);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ index: number; data: OrderItemFormValues } | null>(null);

  const router = useRouter();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      items: [],
      deliveryAddress: '',
      pickupRequired: true,
      vehicleId: '',
      remarks: '',
      discountType: 'fixed',
      discountValue: 0,
      deliveryCharge: 0,
      paymentMethod: '',
      initialPaid: 0,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedFormValues = form.watch();

  const priceDetails: PriceDetails = useMemo(() => {
    const { items, discountType, discountValue, deliveryCharge, initialPaid } = watchedFormValues;
    const price = (items || []).reduce((total, item) => {
      const itemTotal = (item.quantity || 0) * (item.rentRate || 0) * (item.numberOfDays || 0);
      return total + itemTotal;
    }, 0);

    let discountAmount = 0;
    const discountVal = Number(discountValue) || 0;
    if (discountType === 'fixed') {
      discountAmount = discountVal;
    } else if (discountType === 'percentage') {
      discountAmount = price * (discountVal / 100);
    }
    
    const deliveryChargeVal = Number(deliveryCharge) || 0;
    const total = price - discountAmount + deliveryChargeVal;
    const remainingAmount = total - (Number(initialPaid) || 0);

    return { price, discountAmount, deliveryCharge: deliveryChargeVal, total, remainingAmount };
  }, [watchedFormValues]);
  
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customerId', selectedCustomer.id);
      form.setValue('deliveryAddress', selectedCustomer.address || '');
    } else {
        form.setValue('customerId', '');
        form.setValue('deliveryAddress', '');
    }
  }, [selectedCustomer, form]);

  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
      const newCustomer = addCustomer(customerData);
      setSelectedCustomer(newCustomer);
      setIsCustomerDialogOpen(false);
  };

  const handleOpenItemDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingItem({ index, data: fields[index] });
    } else {
      setEditingItem(null);
    }
    setIsItemDialogOpen(true);
  };
  
  const handleSaveItem = (data: OrderItemFormValues) => {
    if (editingItem) {
      update(editingItem.index, data);
    } else {
      append(data);
    }
    setIsItemDialogOpen(false);
    setEditingItem(null);
  };

  async function onSubmit(values: OrderFormValues) {
    if (!selectedCustomer) {
      form.setError('customerId', { type: 'manual', message: 'Please select a customer.' });
      return;
    }
    console.log(values);
    
    const newOrder: Order = {
      id: `ORD${(mockOrders.length + 1).toString().padStart(3, '0')}`,
      customer: selectedCustomer,
      items: values.items as OrderItem[],
      priceDetails: priceDetails,
      deliveryAddress: values.deliveryAddress,
      pickupRequired: values.pickupRequired,
      vehicleId: values.vehicleId,
      remarks: values.remarks,
      discountType: values.discountType,
      discountValue: values.discountValue,
      paymentMethod: values.paymentMethod,
      initialPaid: values.initialPaid,
      createdAt: new Date().toISOString(),
      status: 'Active',
    };
    mockOrders.unshift(newOrder);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    router.push('/reports');
  }

  return (
    <>
      <OrderItemDialog
        isOpen={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        onSave={handleSaveItem}
        products={products}
        item={editingItem?.data}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Rental Items</CardTitle>
                <CardDescription>Add utensils to the order.</CardDescription>
              </div>
              <Button size="sm" type="button" onClick={() => handleOpenItemDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg flex justify-between items-center bg-secondary/20">
                  <div>
                    <p className="font-medium">{products.find(p => p.id === field.productId)?.name || 'Item not selected'}</p>
                    <p className="text-sm text-muted-foreground">
                      {field.quantity} units x {field.numberOfDays} days @ ₹{(Number(field.rentRate) || 0).toFixed(2)}/day
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">₹{(field.quantity * Number(field.rentRate) * field.numberOfDays).toFixed(2)}</p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleOpenItemDialog(index)} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {form.formState.errors.items?.root && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.root.message}</p>}
              {fields.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                    <p>No items added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Delivery &amp; Remarks</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea id="address" placeholder="Enter delivery address" {...form.register('deliveryAddress')} />
                {form.formState.errors.deliveryAddress && <p className="text-sm font-medium text-destructive">{form.formState.errors.deliveryAddress.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                    <Controller
                      control={form.control}
                      name="pickupRequired"
                      render={({ field }) => (
                        <Switch id="pickup-required" checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="pickup-required" className="cursor-pointer">Pickup Required</Label>
                </div>
                {form.watch('pickupRequired') && (
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle Number</Label>
                    <Controller
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue placeholder="Select a vehicle" /></SelectTrigger>
                          <SelectContent>
                            {mockVehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.number}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" placeholder="Add any special instructions or notes here" {...form.register('remarks')}/>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="sticky top-20">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-15rem)]">
                <div>
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between mt-2 p-3 border rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium">{selectedCustomer.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>Change</Button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 mt-2">
                      <Controller
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                            <Select onValueChange={(value) => {
                              const customer = customers.find(c => c.id === value);
                              setSelectedCustomer(customer || null);
                              field.onChange(value);
                            }} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                            <SelectContent>
                              {customers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    <div>
                                      <p>{customer.name}</p>
                                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                    </div>
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}    
                      />
                      <CustomerFormDialog 
                        onSave={handleSaveCustomer}
                        open={isCustomerDialogOpen}
                        onOpenChange={setIsCustomerDialogOpen}
                      >
                        <Button type="button" size="icon" onClick={() => setIsCustomerDialogOpen(true)}>
                          <PlusCircle />
                        </Button>
                      </CustomerFormDialog>
                    </div>
                  )}
                  {form.formState.errors.customerId && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.customerId.message}</p>}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{priceDetails.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Discount</Label>
                    <div className="flex items-center gap-2 w-3/5">
                      <Controller
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full h-8"><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">₹ (Fixed)</SelectItem>
                              <SelectItem value="percentage">% (Percent)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Input type="number" placeholder="0" className="w-full h-8" {...form.register('discountValue')} />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount Amount</span>
                    <span className="text-destructive">- ₹{priceDetails.discountAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Delivery Charge</Label>
                    <div className="w-2/5">
                      <Input type="number" placeholder="0.00" className="h-8 text-right w-full" {...form.register('deliveryCharge')} />
                    </div>
                  </div>
                </div>
                <Separator />

                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₹{priceDetails.total.toFixed(2)}</span>
                </div>
                
                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Payment Method *</Label>
                    <Controller
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-2/5 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {form.formState.errors.paymentMethod && <p className="text-sm font-medium text-destructive text-right -mt-2">{form.formState.errors.paymentMethod.message}</p>}
                  
                  <div className="flex items-center justify-between">
                    <Label>Initial Paid</Label>
                    <div className="w-2/5">
                      <Input type="number" placeholder="0.00" className="h-9 text-right w-full" {...form.register('initialPaid')}/>
                    </div>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-base bg-secondary/50 p-2 rounded-md">
                    <span>Remaining</span>
                    <span>₹{priceDetails.remainingAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </>
  );
}
