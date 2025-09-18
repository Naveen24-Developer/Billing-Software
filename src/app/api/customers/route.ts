import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, createCustomer } from '@/lib/db/queries';

export async function GET() {
  try {
    const customers = await getCustomers();
    
    // Transform the data to match frontend expectations (camelCase)
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      aadhar: customer.aadhar,
      referredBy: customer.referred_by, // Transform snake_case to camelCase
      createdAt: customer.created_at
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: transformedCustomers 
    });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }
    
    const customer = await createCustomer(body);
    
    // Transform the response to match frontend expectations
    const transformedCustomer = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      aadhar: customer.aadhar,
      referredBy: customer.referred_by,
      createdAt: customer.created_at
    };
    
    return NextResponse.json({ 
      success: true, 
      data: transformedCustomer 
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}