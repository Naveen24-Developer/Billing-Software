import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';


export const customers = pgTable('customers', {
  // string id → use uuid; switch to text('id') if you don't want UUIDs
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),

  // phone as string per interface (E.164 fits in 20)
  phone: varchar('phone', { length: 20 }).notNull(),

  address: text('address'),

  // Aadhaar is 12 digits; keep as string
  aadhar: varchar('aadhar', { length: 12 }),

  // optional referrer id (same type as id); add FK later if needed
  referredBy: uuid('referred_by'),

  // interface uses strings, so set mode:'string'
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

