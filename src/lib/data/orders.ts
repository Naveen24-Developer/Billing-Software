import { db } from "@/lib/db/pg/db.pg";
import { orders, orderItems, customers, products, vehicles } from "@/lib/db/pg/schema.pg";
import { eq, desc, and, sql } from "drizzle-orm";

// Updated Order type that matches your frontend structure
export interface Order {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    address: string;
    aadhar?: string;
    referredBy?: string;
    createdAt: string;
    updatedAt?: string;
  };
  items: OrderItem[];
  priceDetails: {
    price: number;
    discountAmount: number;
    deliveryCharge: number;
    total: number;
    remainingAmount: number;
  };
  deliveryAddress: string;
  pickupRequired: boolean;
  vehicleId?: string;
  remarks?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  paymentMethod: string;
  initialPaid?: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    quantity: number;
    rate: number;
    rate_unit: 'day' | 'hour' | 'month';
  };
  quantity: number;
  productRate: number;
  rentRate: number;
  numberOfDays: number;
  createdAt?: string;
}

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

// Calculate price details helper function
function calculatePriceDetails(
  items: OrderItem[],
  discountType?: 'fixed' | 'percentage',
  discountValue?: number,
  deliveryCharge?: number,
  initialPaid?: number
) {
  const price = items.reduce((total, item) => {
    return total + (item.quantity * item.rentRate * item.numberOfDays);
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

  return {
    price,
    discountAmount,
    deliveryCharge: deliveryChargeVal,
    total,
    remainingAmount
  };
}

// Get all orders
export async function getAllOrders(): Promise<Order[]> {
  const orderRows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const result: Order[] = [];

  for (const orderRow of orderRows) {
    // Get customer data
    const customerRow = await db
      .select()
      .from(customers)
      .where(eq(customers.id, orderRow.customerId))
      .then(rows => rows[0]);

    if (!customerRow) continue;

    // Get order items with product details
    const itemRows = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        productRate: orderItems.productRate,
        rentRate: orderItems.rentRate,
        numberOfDays: orderItems.numberOfDays,
        createdAt: orderItems.createdAt,
        productName: products.name,
        productQuantity: products.quantity,
        productRateValue: products.rate,
        productRateUnit: products.rateUnit,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderRow.id));

    const orderItemsData: OrderItem[] = itemRows.map(item => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.productId,
        name: item.productName || 'Unknown Product',
        quantity: item.productQuantity || 0,
        rate: Number(item.productRateValue) || 0,
        rate_unit: item.productRateUnit as 'day' | 'hour' | 'month' || 'day'
      },
      quantity: item.quantity,
      productRate: Number(item.productRate),
      rentRate: Number(item.rentRate),
      numberOfDays: item.numberOfDays,
      createdAt: item.createdAt
    }));

    // Calculate price details
    const priceDetails = calculatePriceDetails(
      orderItemsData,
      orderRow.discountType as 'fixed' | 'percentage' | undefined,
      Number(orderRow.discountValue) || 0,
      Number(orderRow.deliveryCharge) || 0,
      Number(orderRow.initialPaid) || 0
    );

    result.push({
      id: orderRow.id,
      customerId: orderRow.customerId,
      customer: {
        id: customerRow.id,
        name: customerRow.name,
        phone: customerRow.phone,
        address: customerRow.address || '',
        aadhar: customerRow.aadhar || undefined,
        referredBy: customerRow.referredBy || undefined,
        createdAt: customerRow.createdAt,
        updatedAt: customerRow.updatedAt
      },
      items: orderItemsData,
      priceDetails,
      deliveryAddress: orderRow.deliveryAddress,
      pickupRequired: orderRow.pickupRequired,
      vehicleId: orderRow.vehicleId || undefined,
      remarks: orderRow.remarks || undefined,
      discountType: orderRow.discountType as 'fixed' | 'percentage' | undefined,
      discountValue: Number(orderRow.discountValue) || undefined,
      paymentMethod: orderRow.paymentMethod,
      initialPaid: Number(orderRow.initialPaid) || undefined,
      status: orderRow.status as 'Active' | 'Completed' | 'Cancelled',
      createdAt: orderRow.createdAt,
      updatedAt: orderRow.updatedAt
    });
  }

  return result;
}

// Get order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  const orderRow = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .then(rows => rows[0]);

  if (!orderRow) return null;

  // Get customer data
  const customerRow = await db
    .select()
    .from(customers)
    .where(eq(customers.id, orderRow.customerId))
    .then(rows => rows[0]);

  if (!customerRow) return null;

  // Get order items with product details
  const itemRows = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      productRate: orderItems.productRate,
      rentRate: orderItems.rentRate,
      numberOfDays: orderItems.numberOfDays,
      createdAt: orderItems.createdAt,
      productName: products.name,
      productQuantity: products.quantity,
      productRateValue: products.rate,
      productRateUnit: products.rateUnit,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderRow.id));

  const orderItemsData: OrderItem[] = itemRows.map(item => ({
    id: item.id,
    productId: item.productId,
    product: {
      id: item.productId,
      name: item.productName || 'Unknown Product',
      quantity: item.productQuantity || 0,
      rate: Number(item.productRateValue) || 0,
      rate_unit: item.productRateUnit as 'day' | 'hour' | 'month' || 'day'
    },
    quantity: item.quantity,
    productRate: Number(item.productRate),
    rentRate: Number(item.rentRate),
    numberOfDays: item.numberOfDays,
    createdAt: item.createdAt
  }));

  // Calculate price details
  const priceDetails = calculatePriceDetails(
    orderItemsData,
    orderRow.discountType as 'fixed' | 'percentage' | undefined,
    Number(orderRow.discountValue) || 0,
    Number(orderRow.deliveryCharge) || 0,
    Number(orderRow.initialPaid) || 0
  );

  return {
    id: orderRow.id,
    customerId: orderRow.customerId,
    customer: {
      id: customerRow.id,
      name: customerRow.name,
      phone: customerRow.phone,
      address: customerRow.address || '',
      aadhar: customerRow.aadhar || undefined,
      referredBy: customerRow.referredBy || undefined,
      createdAt: customerRow.createdAt,
      updatedAt: customerRow.updatedAt
    },
    items: orderItemsData,
    priceDetails,
    deliveryAddress: orderRow.deliveryAddress,
    pickupRequired: orderRow.pickupRequired,
    vehicleId: orderRow.vehicleId || undefined,
    remarks: orderRow.remarks || undefined,
    discountType: orderRow.discountType as 'fixed' | 'percentage' | undefined,
    discountValue: Number(orderRow.discountValue) || undefined,
    paymentMethod: orderRow.paymentMethod,
    initialPaid: Number(orderRow.initialPaid) || undefined,
    status: orderRow.status as 'Active' | 'Completed' | 'Cancelled',
    createdAt: orderRow.createdAt,
    updatedAt: orderRow.updatedAt
  };
}

// Create new order
export async function createOrder(data: CreateOrderData): Promise<Order> {
  // Start transaction
  const result = await db.transaction(async (tx) => {
    // Insert order
    const [orderRow] = await tx
      .insert(orders)
      .values({
        customerId: data.customerId,
        deliveryAddress: data.deliveryAddress,
        pickupRequired: data.pickupRequired,
        vehicleId: data.vehicleId || null,
        remarks: data.remarks || null,
        discountType: data.discountType || null,
        discountValue: data.discountValue?.toString() || '0',
        deliveryCharge: data.deliveryCharge?.toString() || '0',
        paymentMethod: data.paymentMethod,
        initialPaid: data.initialPaid?.toString() || '0',
        status: 'Active'
      })
      .returning();

    // Insert order items
    if (data.items && data.items.length > 0) {
      await Promise.all(
        data.items.map(item =>
          tx.insert(orderItems).values({
            orderId: orderRow.id,
            productId: item.productId,
            quantity: item.quantity,
            productRate: item.productRate.toString(),
            rentRate: item.rentRate.toString(),
            numberOfDays: item.numberOfDays
          })
        )
      );
    }

    return orderRow;
  });

  // Return complete order
  const completeOrder = await getOrderById(result.id);
  if (!completeOrder) {
    throw new Error('Failed to create order');
  }

  return completeOrder;
}

// Update order status
export async function updateOrderStatus(id: string, status: 'Active' | 'Completed' | 'Cancelled'): Promise<Order> {
  const [orderRow] = await db
    .update(orders)
    .set({ 
      status,
      updatedAt: new Date().toISOString()
    })
    .where(eq(orders.id, id))
    .returning();

  if (!orderRow) {
    throw new Error('Order not found');
  }

  const completeOrder = await getOrderById(orderRow.id);
  if (!completeOrder) {
    throw new Error('Failed to update order');
  }

  return completeOrder;
}

// Update entire order
export async function updateOrder(id: string, data: Partial<CreateOrderData>): Promise<Order> {
  const result = await db.transaction(async (tx) => {
    // Update order main data
    const updateData: any = {};
    if (data.deliveryAddress) updateData.deliveryAddress = data.deliveryAddress;
    if (data.pickupRequired !== undefined) updateData.pickupRequired = data.pickupRequired;
    if (data.vehicleId !== undefined) updateData.vehicleId = data.vehicleId || null;
    if (data.remarks !== undefined) updateData.remarks = data.remarks || null;
    if (data.discountType !== undefined) updateData.discountType = data.discountType || null;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue?.toString() || '0';
    if (data.deliveryCharge !== undefined) updateData.deliveryCharge = data.deliveryCharge?.toString() || '0';
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
    if (data.initialPaid !== undefined) updateData.initialPaid = data.initialPaid?.toString() || '0';
    updateData.updatedAt = new Date().toISOString();

    const [orderRow] = await tx
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    // Update order items if provided
    if (data.items) {
      // Delete existing items
      await tx.delete(orderItems).where(eq(orderItems.orderId, id));
      
      // Insert new items
      if (data.items.length > 0) {
        await Promise.all(
          data.items.map(item =>
            tx.insert(orderItems).values({
              orderId: id,
              productId: item.productId,
              quantity: item.quantity,
              productRate: item.productRate.toString(),
              rentRate: item.rentRate.toString(),
              numberOfDays: item.numberOfDays
            })
          )
        );
      }
    }

    return orderRow;
  });

  const completeOrder = await getOrderById(id);
  if (!completeOrder) {
    throw new Error('Failed to update order');
  }

  return completeOrder;
}

// Delete order
export async function deleteOrder(id: string): Promise<boolean> {
  const result = await db.transaction(async (tx) => {
    // Delete order items first (cascade should handle this, but being explicit)
    await tx.delete(orderItems).where(eq(orderItems.orderId, id));
    
    // Delete order
    const result = await tx.delete(orders).where(eq(orders.id, id));
    
    return result;
  });

  return result.rowCount > 0;
}