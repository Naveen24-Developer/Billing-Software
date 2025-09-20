// scripts/db-migrate.ts
import "dotenv/config";

// tiny ANSI color helpers (no extra deps)
const color = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
};

async function main() {
  try {
    // dynamic import so it runs only when script is called
    const mod: any = await import("../src/lib/db/pg/migrate.pg");

    // if your migrate module exports a default async function, run it:
    if (typeof mod?.default === "function") {
      await mod.default();
    }

    console.info("🚀 DB Migration completed");
    process.exit(0);
  } catch (err) {
    console.error(err);

    console.warn(
      `
${color.red("🚨 Migration failed due to incompatible schema.")}

❗️DB Migration failed – incompatible schema detected.

This version introduces a complete rework of the database schema.
As a result, your existing database structure may no longer be compatible.

**To resolve this:**

1. Drop all existing tables in your database.
2. Then run the following command to apply the latest schema:

${color.green("pnpm db:migrate")}

**Note:** This schema overhaul lays the foundation for more stable updates moving forward.
You shouldn’t have to do this kind of reset again in future releases.

Need help? Open an issue on GitHub 🙏
      `.trim(),
    );

    process.exit(1);
  }
}

main();