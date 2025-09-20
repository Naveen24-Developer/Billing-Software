DO $$ BEGIN
 CREATE TYPE "discount_type" AS ENUM('fixed', 'percentage');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "order_status" ADD VALUE 'Active';--> statement-breakpoint
ALTER TYPE "order_status" ADD VALUE 'Completed';--> statement-breakpoint
ALTER TYPE "order_status" ADD VALUE 'Cancelled';--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "discount_type" SET DATA TYPE discount_type;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_charge" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "initial_paid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "discount_amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "discount_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Active';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;