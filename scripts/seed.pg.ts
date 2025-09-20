import { db } from "@/lib/db/pg/db.pg";
import { users, units, paymentMethods } from "@/lib/db/pg/schema.pg";
import { generateHashedPassword } from "@/lib/db/utils";

export async function seedDatabase() {

    // Insert default user if not exists
    /* await db
        .insert(users)
        .values([
            {
                name: "Sammy Agency",
                phone: 9942699949,
                password: generateHashedPassword("Saamy@123"),
                email: "sammyagencyadmin@mailinator.com",
                createdAt: new Date()
            },
            {
                name: "Tamilarasu",
                phone: 9677545696,
                password: generateHashedPassword("Saamy@123"),
                email: "tamilarasu@fuzionest.com",
                createdAt: new Date()
            },
            {
                name: "Ashok",
                phone: 7373185678,
                password: generateHashedPassword("Ashok@2025"),
                email: "ashok.sa@mailinator.com",
                createdAt: new Date()
            }
        ])
        .onConflictDoNothing(); // avoids duplicate insert

    // Insert default units
    await db
        .insert(units)
        .values([{ name: "unit" }, { name: "nos" }])
        .onConflictDoNothing(); // optional

    // Insert default payment methods
    await db
        .insert(paymentMethods)
        .values([
            { name: "cash" },
            { name: "card" },
            { name: "gpay" },
            { name: "credit" }
        ])
        .onConflictDoNothing(); */
}



