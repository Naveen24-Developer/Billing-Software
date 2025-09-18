import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, updateCustomer, deleteCustomer } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCustomerById(params.id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
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
    
    return NextResponse.json({ success: true, data: transformedCustomer });
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
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
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }
    
    const customer = await updateCustomer(params.id, body);
    
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
    
    return NextResponse.json({ success: true, data: transformedCustomer });
  } catch (error) {
    console.error('Failed to update customer:', error);
    
    if (error.message === 'Customer not found') {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteCustomer(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Customer deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}