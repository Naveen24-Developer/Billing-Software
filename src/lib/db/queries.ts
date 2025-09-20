import { pool } from './connection';
import { OrderItemFormData, OrderFormData } from '@/lib/db/schema'

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

export interface Product {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  rate_unit: 'day' | 'hour' | 'month';
  created_at: string;
  updated_at: string;
}

// ---- Product input DTO ----
export interface ProductFormData {
  name: string;
  quantity: number;
  rate: number; // numeric(10,2) in DB; send as number
  rate_unit: 'day' | 'hour' | 'month';
}

export interface ProductFormData {
  name: string;
  quantity: number;
  rate: number;
  rate_unit: 'day' | 'hour' | 'month';
}

export interface ProductRow {
  id: string;
  name: string;
  quantity: number;
  rate: string;        // numeric comes back as text; we'll Number() it in route
  rate_unit: 'day' | 'hour' | 'month';
  created_at: string;
  updated_at: string;
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

// Customer queries
export async function getProduct(): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function createProduct(data: ProductFormData): Promise<ProductRow> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query<ProductRow>(
      `
      INSERT INTO products (name, quantity, rate, rate_unit)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        quantity,
        rate::text AS rate,     -- ensure consistent text; caller can Number()
        rate_unit,
        created_at,
        updated_at
      `,
      [data.name, data.quantity, data.rate, data.rate_unit]
    );
    return rows[0];
  } finally {
    client.release();
  }
}


export async function deleteProduct(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    return result.rowCount > 0; // true if something was deleted
  } finally {
    client.release();
  }
}

export async function createOrder(data: OrderFormData) {
  // basic guards
  if (!data.customer_id) throw new Error('customer_id is required');
  if (!data.delivery_address?.trim()) throw new Error('delivery_address is required');
  if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('items are required');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert order
    const { rows: orderRows } = await client.query(
      `
      INSERT INTO orders (
        customer_id, delivery_address, pickup_required, vehicle_id, remarks,
        discount_type, discount_value, delivery_charge, payment_method, initial_paid
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING
        id, customer_id, delivery_address, pickup_required, vehicle_id, remarks,
        discount_type, discount_value, delivery_charge, payment_method, initial_paid,
        status, created_at, updated_at
      `,
      [
        data.customer_id,
        data.delivery_address,
        !!data.pickup_required,
        data.vehicle_id ?? null,
        data.remarks ?? null,
        data.discount_type ?? null,
        data.discount_value ?? 0,
        data.delivery_charge ?? 0,
        data.payment_method,
        data.initial_paid ?? 0,
      ]
    );

    const order = orderRows[0];

    // Insert items
    const itemValues: any[] = [];
    const placeholders: string[] = [];
    let i = 1;

    for (const it of data.items) {
      if (!it.product_id) throw new Error('product_id is required for each item');
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) throw new Error('quantity must be > 0');
      if (!Number.isFinite(it.product_rate)) throw new Error('product_rate must be a number');
      if (!Number.isFinite(it.rent_rate)) throw new Error('rent_rate must be a number');
      if (!Number.isFinite(it.number_of_days) || it.number_of_days <= 0) throw new Error('number_of_days must be > 0');

      placeholders.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
      itemValues.push(
        order.id,
        it.product_id,
        it.quantity,
        it.product_rate,
        it.rent_rate,
        it.number_of_days
      );
    }

    const { rows: itemRows } = await client.query(
      `
      INSERT INTO order_items (
        order_id, product_id, quantity, product_rate, rent_rate, number_of_days
      ) VALUES ${placeholders.join(',')}
      RETURNING
        id, order_id, product_id, quantity, product_rate::text AS product_rate,
        rent_rate::text AS rent_rate, number_of_days, created_at
      `,
      itemValues
    );

    await client.query('COMMIT');

    // numeric->number conversion for JSON response
    const items = itemRows.map((r: any) => ({
      id: r.id,
      order_id: r.order_id,
      product_id: r.product_id,
      quantity: Number(r.quantity),
      product_rate: Number(r.product_rate),
      rent_rate: Number(r.rent_rate),
      number_of_days: Number(r.number_of_days),
      created_at: r.created_at,
    }));

    const result = {
      order: {
        id: order.id,
        customer_id: order.customer_id,
        delivery_address: order.delivery_address,
        pickup_required: order.pickup_required,
        vehicle_id: order.vehicle_id,
        remarks: order.remarks,
        discount_type: order.discount_type,
        discount_value: Number(order.discount_value),
        delivery_charge: Number(order.delivery_charge),
        payment_method: order.payment_method,
        initial_paid: Number(order.initial_paid),
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      items,
    };

    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}