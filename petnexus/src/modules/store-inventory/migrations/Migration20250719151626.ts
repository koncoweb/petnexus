import { Migration } from '@mikro-orm/migrations';

export class Migration20250719151626 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "inventory_movement" ("id" text not null, "store_id" text not null, "product_id" text not null, "variant_id" text not null, "movement_type" text check ("movement_type" in ('restock', 'sale', 'adjustment', 'transfer', 'return')) not null, "quantity" integer not null, "previous_stock" integer not null, "new_stock" integer not null, "reference_id" text not null, "reference_type" text not null, "notes" text not null, "user_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "inventory_movement_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_inventory_movement_deleted_at" ON "inventory_movement" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "store_inventory" ("id" text not null, "store_id" text not null, "product_id" text not null, "variant_id" text not null, "current_stock" integer not null default 0, "minimum_stock" integer not null default 10, "maximum_stock" integer not null default 1000, "reserved_stock" integer not null default 0, "available_stock" integer not null default 0, "last_restock_date" text not null, "last_sale_date" text not null, "stock_turnover_rate" integer not null default 0, "days_of_inventory" integer not null default 0, "low_stock_alert" boolean not null default false, "overstock_alert" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_inventory_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_inventory_deleted_at" ON "store_inventory" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "inventory_movement" cascade;`);

    this.addSql(`drop table if exists "store_inventory" cascade;`);
  }

}
