import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  numeric,
  pgEnum,
  integer
} from 'drizzle-orm/pg-core';

// --- Enums ---
export const discountTypeEnum = pgEnum("discount_type", ["fixed", "percentage"]);
export const orderStatusEnum = pgEnum("order_status", [
  "Active",
  "Completed",
  "Cancelled",
]);
export const rateUnitEnum = pgEnum("rate_unit", ["day", "hour", "month"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "online"]);

// --- Customers Table ---
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address'),
  aadhar: varchar('aadhar', { length: 12 }),
  referredBy: uuid('referred_by'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// --- Products Table ---
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  quantity: integer('quantity').default(0).notNull(),
  rate: numeric('rate', { precision: 10, scale: 2 }).notNull(),
  rateUnit: rateUnitEnum('rate_unit').default('day').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// --- Vehicles Table ---
export const vehicles = pgTable('vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  number: varchar('number', { length: 20 }).notNull().unique(),
  type: varchar('type', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// --- Orders Table ---
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: text('customer_id').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  pickupRequired: boolean('pickup_required').default(true).notNull(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id, { onDelete: 'set null' }),
  remarks: text('remarks'),
  discountType: discountTypeEnum('discount_type'),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).default('0'),
  deliveryCharge: numeric('delivery_charge', { precision: 10, scale: 2 }).default('0'),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  initialPaid: numeric('initial_paid', { precision: 10, scale: 2 }).default('0'),
  status: orderStatusEnum('status').default('Active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// --- Order Items Table ---
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
  quantity: integer('quantity').notNull(),
  productRate: numeric('product_rate', { precision: 10, scale: 2 }).notNull(),
  rentRate: numeric('rent_rate', { precision: 10, scale: 2 }).notNull(),
  numberOfDays: integer('number_of_days').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});