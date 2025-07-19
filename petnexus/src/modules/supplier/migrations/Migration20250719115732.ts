import { Migration } from '@mikro-orm/migrations';

export class Migration20250719115732 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists "restock_order" cascade;`);

    this.addSql(`drop table if exists "restock_order_item" cascade;`);

    this.addSql(`drop table if exists "supplier" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table if not exists "restock_order" ("id" text not null, "supplier_id" text not null, "status" text check ("status" in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) not null default 'pending', "total_items" integer not null default 0, "total_cost" integer not null default 0, "currency_code" text not null default 'USD', "notes" text not null, "expected_delivery_date" text not null, "actual_delivery_date" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restock_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_restock_order_deleted_at" ON "restock_order" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "restock_order_item" ("id" text not null, "restock_order_id" text not null, "product_id" text not null, "variant_id" text not null, "quantity" integer not null, "unit_cost" integer not null, "total_cost" integer not null, "notes" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restock_order_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_restock_order_item_deleted_at" ON "restock_order_item" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "supplier" ("id" text not null, "company_name" text not null, "contact_person" text not null, "email" text not null, "phone" text not null, "address" text not null, "city" text not null, "state" text not null, "country" text not null, "postal_code" text not null, "tax_id" text not null, "payment_terms" text not null, "status" text check ("status" in ('active', 'inactive', 'suspended')) not null default 'active', "notes" text not null, "website" text not null, "whatsapp_number" text not null, "auto_restock_enabled" boolean not null default false, "ai_restock_threshold" integer not null default 10, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "supplier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_supplier_deleted_at" ON "supplier" (deleted_at) WHERE deleted_at IS NULL;`);
  }

}
