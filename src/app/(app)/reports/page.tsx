
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ChevronDown, ChevronUp, FileDown, Printer, Calendar as CalendarIcon } from 'lucide-react';
import { mockOrders, mockProducts } from '@/lib/data';
import type { Order } from '@/lib/types';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';


const getPaymentStatus = (order: Order): { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
  if (order.status === 'Cancelled') return { text: 'Cancelled', variant: 'destructive' };
  if (order.priceDetails.remainingAmount <= 0) return { text: 'Paid', variant: 'secondary' };
  if (order.initialPaid && order.initialPaid > 0) return { text: 'Partial', variant: 'outline' };
  return { text: 'Unpaid', variant: 'destructive' };
};

export default function ReportsPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let filtered = orders;

    switch (filter) {
      case 'today':
        filtered = orders.filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        filtered = orders.filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd'));
        break;
      case 'week':
        const startOfThisWeek = startOfWeek(now);
        const endOfThisWeek = endOfWeek(now);
        filtered = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfThisWeek, end: endOfThisWeek }));
        break;
      case 'month':
        const startOfThisMonth = startOfMonth(now);
        const endOfThisMonth = endOfMonth(now);
        filtered = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfThisMonth, end: endOfThisMonth }));
        break;
      case 'year':
        const startOfThisYear = startOfYear(now);
        const endOfThisYear = endOfYear(now);
        filtered = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfThisYear, end: endOfThisYear }));
        break;
      case 'custom':
        if (dateRange?.from && dateRange?.to) {
          filtered = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: dateRange.from!, end: dateRange.to! }));
        } else if (dateRange?.from) {
           filtered = orders.filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(dateRange.from!, 'yyyy-MM-dd'));
        }
        break;
      default: // 'all'
        filtered = orders;
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [orders, filter, dateRange, searchTerm]);
  
  const handlePrint = () => {
    window.print();
  }
  
  const handleFilterChange = (newFilter: string) => {
    if (newFilter !== 'custom') {
      setDateRange(undefined);
    }
    setFilter(newFilter);
  }
  
  useEffect(() => {
    if (dateRange?.from || dateRange?.to) {
        setFilter('custom');
    }
  }, [dateRange]);

  const filterLabels: { [key: string]: string } = {
    all: 'All',
    today: 'Today',
    yesterday: 'Yesterday',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
    custom: 'Custom Range'
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Order Reports</h2>
          <p className="text-muted-foreground">Review and manage all order details.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[160px] justify-between">
                  {filterLabels[filter] || 'Filter'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFilterChange('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('today')}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('yesterday')}>Yesterday</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('week')}>This Week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('month')}>This Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('year')}>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>{filteredOrders.length} order(s) found.</CardDescription>
            </div>
             <div className="flex flex-wrap items-center gap-4">
              <Input 
                placeholder="Search by Order ID or Customer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                     <FileDown className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>S.No</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Initial Paid</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <Collapsible asChild key={order.id} open={openOrderId === order.id} onOpenChange={() => setOpenOrderId(prev => prev === order.id ? null : order.id)}>
                  <>
                    <TableRow className="cursor-pointer">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {openOrderId === order.id ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'PP')}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell className="text-right">₹{order.priceDetails.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{(order.initialPaid || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{order.priceDetails.remainingAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatus(order).variant}>{getPaymentStatus(order).text}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Mark as Returned</DropdownMenuItem>
                            <DropdownMenuItem onClick={handlePrint}>Print Invoice</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                       <TableRow>
                        <TableCell colSpan={10} className="p-0">
                           <div className="p-4 bg-muted/50">
                            <h4 className="font-semibold mb-2">Order Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div><strong>Address:</strong> {order.deliveryAddress}</div>
                               <div><strong>Payment Method:</strong> {order.paymentMethod}</div>
                               {order.remarks && <div className="col-span-1 sm:col-span-2"><strong>Remarks:</strong> {order.remarks}</div>}
                            </div>
                            <h5 className="font-semibold mt-4 mb-2">Items Rented</h5>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Days</TableHead>
                                  <TableHead className="text-right">Rate</TableHead>
                                  <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.items.map(item => {
                                  const product = mockProducts.find(p => p.id === item.productId);
                                  return (
                                     <TableRow key={item.productId}>
                                      <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{item.numberOfDays}</TableCell>
                                      <TableCell className="text-right">₹{item.rentRate.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">₹{(item.quantity * item.rentRate * item.numberOfDays).toFixed(2)}</TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
           {filteredOrders.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No orders found for the selected criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

