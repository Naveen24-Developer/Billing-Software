// Customer types
export type CustomerProps = {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  referredBy?: string;
  aadhar?: string;
};

// Legacy Customer type for compatibility
export type Customer = CustomerProps;

// Product types
export type Product = {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  rate_unit: 'day' | 'hour' | 'month';
  created_at?: string;
  updated_at?: string;
};

// Vehicle types
export type Vehicle = {
  id: string;
  number: string;
  type?: string;
  created_at?: string;
};

// Order Item types
export type OrderItem = {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  productRate: number;
  rentRate: number;
  numberOfDays: number;
  createdAt?: string;
};

// Price Details type
export type PriceDetails = {
  price: number;
  discountAmount: number;
  deliveryCharge: number;
  total: number;
  remainingAmount: number;
};

// Order types
export type Order = {
  id: string;
  customerId: string;
  customer: CustomerProps;
  items: OrderItem[];
  priceDetails: PriceDetails;
  deliveryAddress: string;
  pickupRequired: boolean;
  vehicleId?: string;
  remarks?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  paymentMethod: string;
  initialPaid?: number;
  createdAt: string;
  updatedAt?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
};

// Form data types for creating/updating orders
export interface CreateOrderData {
  customerId: string;
  items: Omit<OrderItem, 'id' | 'product' | 'createdAt'>[];
  deliveryAddress: string;
  pickupRequired: boolean;
  vehicleId?: string;
  remarks?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  deliveryCharge?: number;
  paymentMethod: string;
  initialPaid?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// Form types for validation
export interface CustomerFormData {
  name: string;
  phone: string;
  address?: string;
  aadhar?: string;
  referredBy?: string;
}

export interface ProductFormData {
  name: string;
  quantity: number;
  rate: number;
  rate_unit: 'day' | 'hour' | 'month';
}

export interface OrderFormData {
  customerId: string;
  items: OrderItemFormData[];
  deliveryAddress: string;
  pickupRequired: boolean;
  vehicleId?: string;
  remarks?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  deliveryCharge?: number;
  paymentMethod: string;
  initialPaid?: number;
}

export interface OrderItemFormData {
  productId: string;
  quantity: number;
  productRate: number;
  rentRate: number;
  numberOfDays: number;
}

// Database schema types (for Drizzle)
export interface DatabaseOrder {
  id: string;
  customerId: string;
  deliveryAddress: string;
  pickupRequired: boolean;
  vehicleId?: string;
  remarks?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: string;
  deliveryCharge?: string;
  paymentMethod: string;
  initialPaid?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  productRate: string;
  rentRate: string;
  numberOfDays: number;
  createdAt: string;
}

// Utility types
export type OrderStatus = 'Active' | 'Completed' | 'Cancelled';
export type DiscountType = 'fixed' | 'percentage';
export type PaymentMethod = 'cash' | 'card' | 'online';
export type RateUnit = 'day' | 'hour' | 'month';