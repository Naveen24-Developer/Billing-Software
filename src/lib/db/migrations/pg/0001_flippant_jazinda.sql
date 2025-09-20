DO $$ BEGIN
 CREATE TYPE "order_status" AS ENUM('active', 'returned', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"delivery_address" text NOT NULL,
	"pickup_required" boolean DEFAULT true NOT NULL,
	"vehicle_id" varchar(50),
	"remarks" text,
	"discount_type" varchar(10),
	"discount_value" numeric(10, 2),
	"delivery_charge" numeric(10, 2) DEFAULT '0',
	"payment_method" varchar(20) NOT NULL,
	"initial_paid" numeric(10, 2) DEFAULT '0',
	"price" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"remaining_amount" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
