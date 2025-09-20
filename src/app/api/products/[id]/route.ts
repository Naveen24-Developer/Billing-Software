// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/pg/db.pg';
import { products } from '@/lib/db/pg/schema.pg';
import { eq } from 'drizzle-orm';
import { deleteProduct } from '@/lib/db/queries';



export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await _req.json();
    const values: Partial<typeof products.$inferInsert> = {};

    if (typeof body.name === 'string') values.name = body.name.trim();
    if (Number.isFinite(body.quantity)) values.quantity = Number(body.quantity);
    if (Number.isFinite(body.rate)) values.rate = Number(body.rate);
    if (typeof body.rate_unit === 'string') values.rateUnit = body.rate_unit;

    if (Object.keys(values).length === 0)
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });

    const [row] = await db
      .update(products)
      .set({ ...values, updatedAt: new Date().toISOString() })
      .where(eq(products.id, params.id))
      .returning();

    if (!row) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const data = {
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      rate: Number(row.rate),
      rate_unit: row.rateUnit,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    };

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('Failed to update product:', e);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteProduct(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}