// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProduct, createProduct } from '@/lib/db/queries';

export async function GET() {
  try {
    const products = await getProduct();
    const transformed = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      quantity: Number(p.quantity),
      rate: Number(p.rate),
      rate_unit: p.rate_unit,    // keep snake_case for your API
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));
    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

type RateUnit = 'day' | 'hour' | 'month';
function isRateUnit(value: any): value is RateUnit {
  return value === 'day' || value === 'hour' || value === 'month';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body?.name ?? '').trim();
    const quantity = Number(body?.quantity);
    const rate = Number(body?.rate);
    const rawRateUnit = String(body?.rate_unit ?? '').trim();

    if (!name || !Number.isFinite(quantity) || !Number.isFinite(rate) || !isRateUnit(rawRateUnit)) {
      return NextResponse.json(
        { success: false, error: 'Missing/invalid fields: name, quantity, rate, rate_unit' },
        { status: 400 }
      );
    }

    // Call queries layer (see reference implementation below)
    const inserted = await createProduct({
      name,
      quantity,
      rate,
      rate_unit: rawRateUnit,
    });

    // normalize output
    const data = {
      id: inserted.id,
      name: inserted.name,
      quantity: Number(inserted.quantity),
      rate: Number(inserted.rate),
      rate_unit: inserted.rate_unit,
      created_at: inserted.created_at,
      updated_at: inserted.updated_at,
    };

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    // log full DB error to server console
    console.error('Failed to create product:', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
      detail: error?.detail,
      hint: error?.hint,
      constraint: error?.constraint,
    });

    // In dev, return a bit more context so you can see the real reason
    const meta =
      process.env.NODE_ENV !== 'production'
        ? { code: error?.code, message: error?.message, detail: error?.detail, hint: error?.hint }
        : undefined;

    return NextResponse.json(
      { success: false, error: 'Failed to create product', meta },
      { status: 500 }
    );
  }
}
