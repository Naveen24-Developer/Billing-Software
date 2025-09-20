// src/app/api/returns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/pg/db.pg';
import { products } from '@/lib/db/pg/schema.pg';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { returns } = await req.json();

        for (const r of returns) {
            if (r.quantity > 0) {
                await db
                    .update(products)
                    .set({ quantity: sql`${products.quantity} + ${r.quantity}` })
                    .where(eq(products.id, r.productId));
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Return update failed:', err);
        return NextResponse.json({ success: false, error: 'Failed to process returns' }, { status: 500 });
    }
}
