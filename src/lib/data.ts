import type { Customer, Product, Order, Vehicle } from './types';

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Alice Johnson', phone: '555-0101', address: '123 Maple St, Springfield', createdAt: '2023-01-15', referredBy: 'Bob Smith', aadhar: '1234 5678 9012' },
  { id: '2', name: 'Bob Smith', phone: '555-0102', address: '456 Oak Ave, Shelbyville', createdAt: '2023-02-20', aadhar: '2345 6789 0123' },
  { id: '3', name: 'Charlie Brown', phone: '555-0103', address: '789 Pine Ln, Capital City', createdAt: '2023-03-10', referredBy: 'Alice Johnson' },
  { id: '4', name: 'Diana Prince', phone: '555-0104', address: '101 Wonder Way, Themyscira', createdAt: '2023-04-05', aadhar: '4567 8901 2345' },
  { id: '5', name: 'Ethan Hunt', phone: '555-0105', address: '21 Jump Street, Langley', createdAt: '2023-05-12' },
];

export const mockProducts: Product[] = [
  { id: '1', name: "Chef's Knife", quantity: 15, rate: 150, rate_unit: 'day' },
  { id: '2', name: 'Cutting Board', quantity: 30, rate: 70, rate_unit: 'day' },
  { id: '3', name: 'Mixing Bowl Set', quantity: 20, rate: 100, rate_unit: 'day' },
  { id: '4', name: 'Measuring Spoons', quantity: 50, rate: 50, rate_unit: 'day' },
  { id: '5', name: 'Frying Pan', quantity: 25, rate: 200, rate_unit: 'day' },
  { id: '6', name: 'Stockpot', quantity: 10, rate: 250, rate_unit: 'day' },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customer: mockCustomers[0],
    items: [
      { productId: '1', quantity: 1, productRate: 150, rentRate: 150, numberOfDays: 2 },
      { productId: '2', quantity: 1, productRate: 70, rentRate: 70, numberOfDays: 2 }
    ],
    priceDetails: { price: 440, discountAmount: 0, deliveryCharge: 50, total: 490, remainingAmount: 490 },
    deliveryAddress: '123 Maple St, Springfield',
    pickupRequired: true,
    paymentMethod: 'cash',
    createdAt: '2023-10-01',
    status: 'Returned'
  },
  {
    id: 'ORD002',
    customer: mockCustomers[1],
    items: [{ productId: '5', quantity: 1, productRate: 200, rentRate: 220, numberOfDays: 3 }],
    priceDetails: { price: 660, discountAmount: 66, deliveryCharge: 0, total: 594, remainingAmount: 94 },
    deliveryAddress: '456 Oak Ave, Shelbyville',
    pickupRequired: false,
    discountType: 'percentage',
    discountValue: 10,
    paymentMethod: 'online',
    initialPaid: 500,
    createdAt: '2023-10-02',
    status: 'Active'
  },
   {
    id: 'ORD003',
    customer: mockCustomers[2],
    items: [{ productId: '3', quantity: 5, productRate: 100, rentRate: 100, numberOfDays: 1 }],
    priceDetails: { price: 500, discountAmount: 0, deliveryCharge: 50, total: 550, remainingAmount: 550 },
    deliveryAddress: '789 Pine Ln, Capital City',
    pickupRequired: true,
    vehicleId: '1',
    paymentMethod: 'card',
    createdAt: '2023-10-03',
    status: 'Cancelled'
  },
];


export const mockVehicles: Vehicle[] = [
  { id: '1', number: 'MH 12 AB 1234' },
  { id: '2', number: 'MH 12 CD 5678' },
  { id: '3', number: 'MH 14 EF 9012' },
];
