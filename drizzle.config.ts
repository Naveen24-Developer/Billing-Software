import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/lib/db/pg/schema.pg.ts",
  out: "./src/lib/db/migrations/pg",
  driver: "pg",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "rental_management",
  },
});
