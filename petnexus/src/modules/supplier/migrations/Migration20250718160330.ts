import { Migration } from '@mikro-orm/migrations';

export class Migration20250718160330 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "supplier" ("id" text not null, "company_name" text not null, "contact_person" text not null, "email" text not null, "phone" text not null, "address" text not null, "city" text not null, "state" text not null, "country" text not null, "postal_code" text not null, "tax_id" text not null, "payment_terms" text not null, "status" text check ("status" in ('active', 'inactive', 'suspended')) not null default 'active', "notes" text not null, "website" text not null, "whatsapp_number" text not null, "auto_restock_enabled" boolean not null default false, "ai_restock_threshold" integer not null default 10, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "supplier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_supplier_deleted_at" ON "supplier" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "supplier" cascade;`);
  }

}
