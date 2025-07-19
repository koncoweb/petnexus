import { Migration } from '@mikro-orm/migrations';

export class Migration20250719132145 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "ai_analysis" ("id" text not null, "restock_order_id" text not null, "request_data" text not null, "ai_model" text not null default 'moonshotai/kimi-k2:free', "ai_response" text not null, "analysis_summary" text not null, "recommended_products" text not null, "priority_scores" text not null, "status" text check ("status" in ('pending', 'processing', 'completed', 'failed')) not null default 'pending', "confidence_score" integer not null default 0, "processed_at" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ai_analysis_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ai_analysis_deleted_at" ON "ai_analysis" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_analytics" ("id" text not null, "product_id" text not null, "variant_id" text not null, "sales_velocity" integer not null, "total_sales" integer not null, "sales_period_days" integer not null, "current_stock" integer not null, "minimum_stock" integer not null, "maximum_stock" integer not null, "stock_turnover_rate" integer not null, "unit_cost" integer not null, "unit_price" integer not null, "profit_margin" integer not null, "total_revenue" integer not null, "total_profit" integer not null, "has_active_promotion" boolean not null default false, "promotion_discount" integer not null, "promotion_type" text not null, "promotion_end_date" text not null, "performance_score" integer not null, "risk_level" text check ("risk_level" in ('low', 'medium', 'high')) not null default 'medium', "analytics_date" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_analytics_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_analytics_deleted_at" ON "product_analytics" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "restock_recommendation" ("id" text not null, "ai_analysis_id" text not null, "product_id" text not null, "variant_id" text not null, "category" text check ("category" in ('fast_moving_low_stock', 'slow_moving_high_stock', 'high_profit_potential', 'supplier_promotions', 'regular_restock')) not null, "priority_score" integer not null, "recommended_quantity" integer not null, "reasoning" text not null, "confidence_level" integer not null, "current_stock" integer not null, "current_sales_velocity" integer not null, "current_profit_margin" integer not null, "has_active_promotion" boolean not null default false, "promotion_details" text not null, "is_implemented" boolean not null default false, "implemented_at" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restock_recommendation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_restock_recommendation_deleted_at" ON "restock_recommendation" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ai_analysis" cascade;`);

    this.addSql(`drop table if exists "product_analytics" cascade;`);

    this.addSql(`drop table if exists "restock_recommendation" cascade;`);
  }

}
