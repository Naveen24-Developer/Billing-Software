import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, updateOrder, deleteOrder } from '@/lib/data/orders';
import type { CreateOrderData } from '@/lib/types';
import { getOrders } from '@/lib/db/queries';

export async function GET() {
  try {
    const orders = await getOrders(); // return list with totals, no items
    return NextResponse.json({ success: true, data: orders });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const order = await getOrderById(params.id);
//     if (!order) {
//       return NextResponse.json(
//         { success: false, error: 'Order not found' },
//         { status: 404 }
//       );
//     }
//     return NextResponse.json({ success: true, data: order });
//   } catch (error) {
//     console.error('Failed to fetch order:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch order' },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate required fields for full update
    if (!body.deliveryAddress || !body.paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields for update. Required: deliveryAddress, paymentMethod'
        },
        { status: 400 }
      );
    }

    // Validate items if provided
    if (body.items) {
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
    }

    // Prepare update data
    const updateData: Partial<CreateOrderData> = {
      deliveryAddress: body.deliveryAddress,
      pickupRequired: body.pickupRequired !== undefined ? body.pickupRequired : undefined,
      vehicleId: body.vehicleId || undefined,
      remarks: body.remarks || undefined,
      discountType: body.discountType || undefined,
      discountValue: body.discountValue || undefined,
      deliveryCharge: body.deliveryCharge || undefined,
      paymentMethod: body.paymentMethod,
      initialPaid: body.initialPaid || undefined
    };

    if (body.items) {
      updateData.items = body.items;
    }

    const order = await updateOrder(params.id, updateData);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order'
      },
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

    // PATCH is used specifically for status updates
    if (!body.status || !['Active', 'Completed', 'Cancelled'].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be one of: Active, Completed, Cancelled' },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(params.id, body.status);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteOrder(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete order'
      },
      { status: 500 }
    );
  }
}