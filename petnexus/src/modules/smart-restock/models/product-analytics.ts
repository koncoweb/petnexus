import { model } from "@medusajs/framework/utils"

const ProductAnalytics = model.define("product_analytics", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  variant_id: model.text(),
  
  // Sales Analytics
  sales_velocity: model.number(), // Units sold per day
  total_sales: model.number(),
  sales_period_days: model.number(),
  
  // Inventory Analytics
  current_stock: model.number(),
  minimum_stock: model.number(),
  maximum_stock: model.number(),
  stock_turnover_rate: model.number(),
  
  // Financial Analytics
  unit_cost: model.number(),
  unit_price: model.number(),
  profit_margin: model.number(),
  total_revenue: model.number(),
  total_profit: model.number(),
  
  // Promotion Analytics
  has_active_promotion: model.boolean().default(false),
  promotion_discount: model.number(),
  promotion_type: model.text(),
  promotion_end_date: model.text(),
  
  // Performance Metrics
  performance_score: model.number(), // 0-100 score
  risk_level: model.enum(["low", "medium", "high"]).default("medium"),
  
  // Timestamps
  analytics_date: model.text(),
})

export default ProductAnalytics 