
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Customer } from '@/lib/types';
import { mockCustomers } from '@/lib/data';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customerData: Omit<Customer, 'id' | 'createdAt'>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: (customers.length + 1 + Math.random()).toString(), // Ensure unique ID
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    setCustomers(customers.map(c => (c.id === id ? { ...c, ...customerData } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };
  
  const getCustomerById = (id: string) => {
    return customers.find(c => c.id === id);
  }

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, getCustomerById }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
