import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db/queries';

export async function GET() {
  try {
    const orders = await getOrders();
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
    const order = await createOrder(body);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}