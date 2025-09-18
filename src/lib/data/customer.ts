import { db } from "@/lib/db/pg/db.pg";
import { customers } from "@/lib/db/pg/schema.pg";
import type { CustomerProps } from "../types";

export async function getAllCustomers(): Promise<CustomerProps[]> {
  const rows = await db.select().from(customers);

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    address: r.address ?? "",      // null -> undefined
    aadhar: r.aadhar ?? "",        // null -> undefined
    referredBy: r.referredBy ?? "",
    createdAt: r.createdAt
  }));
}