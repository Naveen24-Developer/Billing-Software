import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/pg/db.pg';
import { products } from '@/lib/db/pg/schema.pg';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const productRows = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    const formattedProducts = productRows.map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      rate: Number(product.rate),
      rate_unit: product.rateUnit,
      created_at: product.createdAt,
      updated_at: product.updatedAt
    }));

    return NextResponse.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || typeof body.quantity !== 'number' || typeof body.rate !== 'number' || !body.rate_unit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, quantity, rate, rate_unit' },
        { status: 400 }
      );
    }

    const [product] = await db
      .insert(products)
      .values({
        name: body.name,
        quantity: body.quantity,
        rate: body.rate.toString(),
        rateUnit: body.rate_unit
      })
      .returning();

    const formattedProduct = {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      rate: Number(product.rate),
      rate_unit: product.rateUnit,
      created_at: product.createdAt,
      updated_at: product.updatedAt
    };

    return NextResponse.json({ success: true, data: formattedProduct }, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}