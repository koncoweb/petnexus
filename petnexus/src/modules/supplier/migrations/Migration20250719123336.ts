import { Migration } from '@mikro-orm/migrations';

export class Migration20250719123336 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "brand_promotion" ("id" text not null, "supplier_promotion_id" text not null, "brand_id" text not null, "brand_discount_override" integer not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "brand_promotion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_brand_promotion_deleted_at" ON "brand_promotion" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_promotion" ("id" text not null, "supplier_promotion_id" text not null, "product_id" text not null, "variant_id" text not null, "product_discount_override" integer not null, "product_minimum_quantity" integer not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_promotion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_promotion_deleted_at" ON "product_promotion" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "restock_order" ("id" text not null, "supplier_id" text not null, "status" text check ("status" in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) not null default 'pending', "total_items" integer not null default 0, "total_cost" integer not null default 0, "currency_code" text not null default 'USD', "notes" text not null, "expected_delivery_date" text not null, "actual_delivery_date" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restock_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_restock_order_deleted_at" ON "restock_order" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "restock_order_item" ("id" text not null, "restock_order_id" text not null, "product_id" text not null, "variant_id" text not null, "quantity" integer not null, "unit_cost" integer not null, "total_cost" integer not null, "notes" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restock_order_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_restock_order_item_deleted_at" ON "restock_order_item" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "supplier" ("id" text not null, "company_name" text not null, "contact_person" text not null, "email" text not null, "phone" text not null, "address" text not null, "city" text not null, "state" text not null, "country" text not null, "postal_code" text not null, "tax_id" text not null, "payment_terms" text not null, "status" text check ("status" in ('active', 'inactive', 'suspended')) not null default 'active', "notes" text not null, "website" text not null, "whatsapp_number" text not null, "auto_restock_enabled" boolean not null default false, "ai_restock_threshold" integer not null default 10, "promotion_auto_approval" boolean not null default false, "max_active_promotions" integer not null default 5, "promotion_notification_email" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "supplier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_supplier_deleted_at" ON "supplier" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "supplier_promotion" ("id" text not null, "supplier_id" text not null, "name" text not null, "description" text not null, "promotion_type" text check ("promotion_type" in ('brand', 'product', 'category')) not null default 'product', "discount_type" text check ("discount_type" in ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping')) not null default 'percentage', "discount_value" integer not null, "minimum_quantity" integer not null default 1, "maximum_quantity" integer not null, "buy_quantity" integer not null, "get_quantity" integer not null, "start_date" text not null, "end_date" text not null, "status" text check ("status" in ('active', 'inactive', 'expired', 'scheduled')) not null default 'active', "priority" integer not null default 1, "max_usage" integer not null, "current_usage" integer not null default 0, "terms_conditions" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "supplier_promotion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_supplier_promotion_deleted_at" ON "supplier_promotion" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "brand_promotion" cascade;`);

    this.addSql(`drop table if exists "product_promotion" cascade;`);

    this.addSql(`drop table if exists "restock_order" cascade;`);

    this.addSql(`drop table if exists "restock_order_item" cascade;`);

    this.addSql(`drop table if exists "supplier" cascade;`);

    this.addSql(`drop table if exists "supplier_promotion" cascade;`);
  }

}
