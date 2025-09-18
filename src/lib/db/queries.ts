import { pool } from './connection';

// Types to match your schema
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  aadhar?: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  address?: string;
  aadhar?: string;
  referredBy?: string; // Note: frontend uses camelCase
}

// Customer queries
export async function getCustomers(): Promise<Customer[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM customers ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO customers (name, phone, address, aadhar, referred_by) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        data.name, 
        data.phone, 
        data.address || null, 
        data.aadhar || null, 
        data.referredBy || null
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateCustomer(id: string, data: CustomerFormData): Promise<Customer> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE customers 
       SET name = $1, phone = $2, address = $3, aadhar = $4, referred_by = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 
       RETURNING *`,
      [
        data.name, 
        data.phone, 
        data.address || null, 
        data.aadhar || null, 
        data.referredBy || null, 
        id
      ]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Customer not found');
    }
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM customers WHERE id = $1', [id]);
    return result.rowCount > 0;
  } finally {
    client.release();
  }
}