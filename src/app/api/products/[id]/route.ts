import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || body.quantity === undefined || !body.rate || !body.rate_unit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof body.quantity !== 'number' || body.quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof body.rate !== 'number' || body.rate < 0) {
      return NextResponse.json(
        { success: false, error: 'Rate must be a non-negative number' },
        { status: 400 }
      );
    }

    if (!['day', 'hour', 'month'].includes(body.rate_unit)) {
      return NextResponse.json(
        { success: false, error: 'Rate unit must be day, hour, or month' },
        { status: 400 }
      );
    }

    const product = await updateProduct(params.id, {
      name: body.name.trim(),
      quantity: parseInt(body.quantity),
      rate: parseFloat(body.rate),
      rate_unit: body.rate_unit
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Failed to update product:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if product exists
    const existingProduct = await getProductById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await deleteProduct(params.id);
    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    
    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes('constraint')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete product as it is referenced in existing orders' 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}