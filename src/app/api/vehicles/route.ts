import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/pg/db.pg';
import { vehicles } from '@/lib/db/pg/schema.pg';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const vehicleRows = await db
      .select()
      .from(vehicles)
      .orderBy(desc(vehicles.createdAt));

    const formattedVehicles = vehicleRows.map(vehicle => ({
      id: vehicle.id,
      number: vehicle.number,
      type: vehicle.type || undefined,
      created_at: vehicle.createdAt
    }));

    return NextResponse.json({ success: true, data: formattedVehicles });
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.number) {
      return NextResponse.json(
        { success: false, error: 'Vehicle number is required' },
        { status: 400 }
      );
    }

    const [vehicle] = await db
      .insert(vehicles)
      .values({
        number: body.number,
        type: body.type || null
      })
      .returning();

    const formattedVehicle = {
      id: vehicle.id,
      number: vehicle.number,
      type: vehicle.type || undefined,
      created_at: vehicle.createdAt
    };

    return NextResponse.json({ success: true, data: formattedVehicle }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create vehicle:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505' && error.constraint === 'vehicles_number_unique') {
      return NextResponse.json(
        { success: false, error: 'Vehicle number already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}