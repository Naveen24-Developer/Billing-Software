import { NextResponse } from 'next/server';
import { getOrderItemsByOrderId } from '@/lib/db/queries';

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        const items = await getOrderItemsByOrderId(params.id);
        return NextResponse.json({ success: true, data: items });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
