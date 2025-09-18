import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getOrderById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const order = await updateOrderStatus(params.id, body.status);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
