// lib/db/schema.ts
export interface Customer {
    id: string;
    name: string;
    phone: string;
    address?: string;
    aadhar?: string;
    referred_by?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Product {
    id: string;
    name: string;
    quantity: number;
    rate: number;
    rate_unit: 'day' | 'hour' | 'month';
    created_at: string;
    updated_at: string;
  }
  
  export interface Order {
    id: string;
    customer_id: string;
    customer?: Customer;
    delivery_address: string;
    pickup_required: boolean;
    vehicle_id?: string;
    remarks?: string;
    discount_type?: 'fixed' | 'percentage';
    discount_value?: number;
    delivery_charge?: number;
    payment_method: string;
    initial_paid?: number;
    price: number;
    discount_amount: number;
    total: number;
    remaining_amount: number;
    status: 'Active' | 'Completed' | 'Cancelled';
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
  }
  
  export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product?: Product;
    quantity: number;
    product_rate: number;
    rent_rate: number;
    number_of_days: number;
    created_at: string;
  }
  
  export interface Vehicle {
    id: string;
    number: string;
    type?: string;
    created_at: string;
  }
  
  export interface PriceDetails {
    price: number;
    discountAmount: number;
    deliveryCharge: number;
    total: number;
    remainingAmount: number;
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
  
  // Form types
  export interface CustomerFormData {
    name: string;
    phone: string;
    address?: string;
    aadhar?: string;
    referred_by?: string;
  }
  
  export interface ProductFormData {
    name: string;
    quantity: number;
    rate: number;
    rate_unit: 'day' | 'hour' | 'month';
  }
  
  export interface OrderFormData {
    customer_id: string;
    items: OrderItemFormData[];
    delivery_address: string;
    pickup_required: boolean;
    vehicle_id?: string;
    remarks?: string;
    discount_type?: 'fixed' | 'percentage';
    discount_value?: number;
    delivery_charge?: number;
    payment_method: string;
    initial_paid?: number;
  }
  
  export interface OrderItemFormData {
    product_id: string;
    quantity: number;
    product_rate: number;
    rent_rate: number;
    number_of_days: number;
  }