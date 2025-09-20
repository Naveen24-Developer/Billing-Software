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

function isUuid(v: unknown): v is string {
  return typeof v === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate UUID fields
    // if (!isUuid(body?.customer_id)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid customer_id (must be UUID)' },
    //     { status: 400 }
    //   );
    // }
    if (body?.vehicle_id !== undefined && body.vehicle_id !== null && !isUuid(body.vehicle_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vehicle_id (must be UUID or omitted)' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body?.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'items are required (non-empty array)' },
        { status: 400 }
      );
    }

    for (let i = 0; i < body.items.length; i++) {
      const it = body.items[i];
      if (!Number.isFinite(Number(it?.quantity)) || Number(it.quantity) <= 0) {
        return NextResponse.json(
          { success: false, error: `Invalid items[${i}].quantity` },
          { status: 400 }
        );
      }
    }

    // All good -> create
    const created = await createOrder(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });

  } catch (e: any) {
    console.error('Failed to create order:', {
      code: e?.code, message: e?.message, detail: e?.detail, hint: e?.hint
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
