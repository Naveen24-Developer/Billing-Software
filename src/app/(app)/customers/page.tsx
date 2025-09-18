'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import type { CustomerProps } from '@/lib/types';
import CustomerFormDialog from './customer-form-dialog';
import DeleteCustomerAlert from './delete-customer-alert';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
});

export default function CustomersPage() {
  const { data: customersResponse, error, isLoading, mutate } = useSWR('/api/customers', fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProps | null>(null);

  // Extract customers from API response
  const customers = customersResponse?.success ? customersResponse.data : [];

  const handleSaveCustomer = async (customerData: Omit<CustomerProps, 'id' | 'createdAt'>, id?: string) => {
    try {
      if (id) {
        // Update existing customer
        const response = await fetch(`/api/customers/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update customer');
        }
      } else {
        // Create new customer
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create customer');
        }
      }
      
      // Refresh the data
      mutate();
    } catch (error) {
      console.error('Error saving customer:', error);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      
      // Refresh the data
      mutate();
    } catch (error) {
      console.error('Error deleting customer:', error);
      // You might want to show a toast notification here
    }
  };
  
  const handleOpenDialog = (customer: CustomerProps | null = null) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const filteredCustomers = customers.filter((customer: CustomerProps) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading customers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading customers. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-3xl font-bold tracking-tight font-headline">Customers</h2>
          <CardDescription>
            Manage your customers here.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search customers..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>
      
      <CustomerFormDialog 
        customer={selectedCustomer} 
        onSave={handleSaveCustomer}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <span />
      </CustomerFormDialog>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No customers found. Add your first customer to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Aadhar</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer: CustomerProps) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address || 'N/A'}</TableCell>
                    <TableCell>{customer.aadhar || 'N/A'}</TableCell>
                    <TableCell>{customer.referredBy || 'N/A'}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>
                            Edit
                          </DropdownMenuItem>
                          <DeleteCustomerAlert onDelete={() => handleDeleteCustomer(customer.id)} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}