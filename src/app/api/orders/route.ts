import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder } from '@/lib/data/orders';
import type { CreateOrderData } from '@/lib/types';

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerId || !body.items || body.items.length === 0 || !body.paymentMethod || !body.deliveryAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields. Required: customerId, items (non-empty), paymentMethod, deliveryAddress' 
        },
        { status: 400 }
      );
    }

    // Validate items structure
    const hasValidItems = body.items.every((item: any) => 
      item.productId && 
      typeof item.quantity === 'number' && item.quantity > 0 &&
      typeof item.productRate === 'number' && item.productRate >= 0 &&
      typeof item.rentRate === 'number' && item.rentRate >= 0 &&
      typeof item.numberOfDays === 'number' && item.numberOfDays > 0
    );

    if (!hasValidItems) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid items structure. Each item must have productId, quantity > 0, productRate >= 0, rentRate >= 0, numberOfDays > 0' 
        },
        { status: 400 }
      );
    }

    // Prepare order data
    const orderData: CreateOrderData = {
      customerId: body.customerId,
      items: body.items,
      deliveryAddress: body.deliveryAddress,
      pickupRequired: body.pickupRequired !== undefined ? body.pickupRequired : true,
      vehicleId: body.vehicleId || undefined,
      remarks: body.remarks || undefined,
      discountType: body.discountType || undefined,
      discountValue: body.discountValue || undefined,
      deliveryCharge: body.deliveryCharge || undefined,
      paymentMethod: body.paymentMethod,
      initialPaid: body.initialPaid || undefined
    };

    const order = await createOrder(orderData);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}