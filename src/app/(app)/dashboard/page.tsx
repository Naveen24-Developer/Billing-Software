
'use client';

import { useState, useMemo, useEffect } from 'react';
import { IndianRupee, Package, Users, Activity, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardChart } from '@/components/dashboard-chart';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { mockOrders, mockProducts } from '@/lib/data';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCustomers } from '@/contexts/customer-context';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [orders] = useState(mockOrders);
  const { customers } = useCustomers();
  const [products] = useState(mockProducts);

  // Calculate metrics based on time range
  const metrics = useMemo(() => {
    const now = new Date();
    let filteredOrders = orders;
    let filteredCustomers = customers;

    // Filter data based on selected time range
    switch (timeRange) {
      case 'today':
        filteredOrders = orders.filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));
        filteredCustomers = customers.filter(c => format(new Date(c.createdAt), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));
        break;
      case 'week':
        const startOfThisWeek = startOfWeek(now);
        const endOfThisWeek = endOfWeek(now);
        filteredOrders = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfThisWeek, end: endOfThisWeek }));
        filteredCustomers = customers.filter(c => isWithinInterval(new Date(c.createdAt), { start: startOfThisWeek, end: endOfThisWeek }));
        break;
      case 'year':
        const startOfThisYear = startOfYear(now);
        const endOfThisYear = endOfYear(now);
        filteredOrders = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfThisYear, end: endOfThisYear }));
        filteredCustomers = customers.filter(c => isWithinInterval(new Date(c.createdAt), { start: startOfThisYear, end: endOfThisYear }));
        break;
      default: // 'month'
        const startOfThisMonth = startOfMonth(now);
        const endOfThisMonth = endOfMonth(now);
        filteredOrders = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfThisMonth, end: endOfThisMonth }));
        filteredCustomers = customers.filter(c => isWithinInterval(new Date(c.createdAt), { start: startOfThisMonth, end: endOfThisMonth }));
        break;
    }

    // Calculate total revenue
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.priceDetails.total, 0);
    
    // Calculate previous period for comparison
    let previousPeriodOrders = orders;
    let previousPeriodCustomers = customers;
    
    switch (timeRange) {
      case 'today':
        const yesterday = subDays(now, 1);
        previousPeriodOrders = orders.filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd'));
        previousPeriodCustomers = customers.filter(c => format(new Date(c.createdAt), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd'));
        break;
      case 'week':
        const startOfLastWeek = startOfWeek(subDays(now, 7));
        const endOfLastWeek = endOfWeek(subDays(now, 7));
        previousPeriodOrders = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfLastWeek, end: endOfLastWeek }));
        previousPeriodCustomers = customers.filter(c => isWithinInterval(new Date(c.createdAt), { start: startOfLastWeek, end: endOfLastWeek }));
        break;
      case 'year':
        const startOfLastYear = startOfYear(subDays(now, 365));
        const endOfLastYear = endOfYear(subDays(now, 365));
        previousPeriodOrders = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfLastYear, end: endOfLastYear }));
        previousPeriodCustomers = customers.filter(c => isWithinInterval(new Date(c.createdAt), { start: startOfLastYear, end: endOfLastYear }));
        break;
      default: // 'month'
        const startOfLastMonth = startOfMonth(subDays(now, 31));
        const endOfLastMonth = endOfMonth(subDays(now, 31));
        previousPeriodOrders = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: startOfLastMonth, end: endOfLastMonth }));
        previousPeriodCustomers = customers.filter(c => isWithinInterval(new Date(c.createdAt), { start: startOfLastMonth, end: endOfLastMonth }));
        break;
    }

    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.priceDetails.total, 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : (totalRevenue > 0 ? 100 : 0);
    
    const ordersChange = previousPeriodOrders.length > 0 
      ? ((filteredOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 
      : (filteredOrders.length > 0 ? 100 : 0);
    
    const customersChange = previousPeriodCustomers.length > 0 
      ? ((filteredCustomers.length - previousPeriodCustomers.length) / previousPeriodCustomers.length) * 100 
      : (filteredCustomers.length > 0 ? 100 : 0);

    // Calculate active rentals (orders that are not completed/returned)
    const activeRentals = orders.filter(order => order.status === 'Active').length;
    const previousActiveRentals = orders.filter(order => 
      order.status === 'Active' && 
      isWithinInterval(new Date(order.createdAt), { 
        start: subDays(now, 60), 
        end: subDays(now, 30) 
      })
    ).length;
    
    const activeRentalsChange = previousActiveRentals > 0 
      ? ((activeRentals - previousActiveRentals) / previousActiveRentals) * 100 
      : (activeRentals > 0 ? 100 : 0);

    // Get top selling products
    const productSales: { [key: string]: number } = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = 0;
        }
        productSales[item.productId] += item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          name: product?.name || 'Unknown',
          quantity,
          total: quantity * (product?.rate || 0)
        };
      });

    // Get recent orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      activeRentals,
      newCustomers: filteredCustomers.length,
      revenueChange,
      ordersChange,
      activeRentalsChange,
      customersChange,
      topProducts,
      recentOrders
    };
  }, [timeRange, orders, customers, products]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your rental business performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center pt-1">
              {metrics.revenueChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className={cn(
                "text-xs",
                metrics.revenueChange >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {metrics.revenueChange >= 0 ? "+" : ""}{metrics.revenueChange.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground ml-1">from previous period</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <div className="flex items-center pt-1">
              {metrics.ordersChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className={cn(
                "text-xs",
                metrics.ordersChange >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {metrics.ordersChange >= 0 ? "+" : ""}{metrics.ordersChange.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground ml-1">from previous period</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRentals}</div>
            <div className="flex items-center pt-1">
              {metrics.activeRentalsChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className={cn(
                "text-xs",
                metrics.activeRentalsChange >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {metrics.activeRentalsChange >= 0 ? "+" : ""}{metrics.activeRentalsChange.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground ml-1">from previous period</p>
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.newCustomers}</div>
            <div className="flex items-center pt-1">
              {metrics.customersChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className={cn(
                "text-xs",
                metrics.customersChange >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {metrics.customersChange >= 0 ? "+" : ""}{metrics.customersChange.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground ml-1">from previous period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Revenue trends for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity} rentals</p>
                  </div>
                  <div className="font-medium">₹{product.total.toFixed(2)}</div>
                </div>
              ))}
              {metrics.topProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data for this period</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders placed in your store</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell className="text-right">₹{order.priceDetails.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={order.status === 'Active' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current stock levels of your products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {product.quantity} in stock
                    </span>
                  </div>
                  <Progress 
                    value={(product.quantity / 50) * 100} 
                    className={cn(
                      "h-2",
                      product.quantity > 20 ? "bg-green-100" : 
                      product.quantity > 10 ? "bg-yellow-100" : "bg-red-100"
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
