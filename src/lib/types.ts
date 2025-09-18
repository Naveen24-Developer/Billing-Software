export type CustomerProps = {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  referredBy?: string;
  aadhar?: string;
};

export type Product = {
  id:string;
  name: string;
  quantity: number;
  rate: number;
  rate_unit: 'day' | 'hour' | 'month';
};

export type OrderItem = {
  productId: string;
  quantity: number;
  productRate: number;
  rentRate: number;
  numberOfDays: number;
};

export type PriceDetails = {
  price: number;
  discountAmount: number;
  deliveryCharge: number;
  total: number;
  remainingAmount: number;
}

export type Order = {
  id: string;
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
  status: 'Active' | 'Returned' | 'Cancelled';
};

export type Vehicle = {
  id: string;
  number: string;
};
