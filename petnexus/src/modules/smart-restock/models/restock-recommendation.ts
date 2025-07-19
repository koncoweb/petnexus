import { model } from "@medusajs/framework/utils"

const RestockRecommendation = model.define("restock_recommendation", {
  id: model.id().primaryKey(),
  ai_analysis_id: model.text(),
  product_id: model.text(),
  variant_id: model.text(),
  
  // Recommendation Details
  category: model.enum(["fast_moving_low_stock", "slow_moving_high_stock", "high_profit_potential", "supplier_promotions", "regular_restock"]),
  priority_score: model.number(),
  recommended_quantity: model.number(),
  reasoning: model.text(),
  confidence_level: model.number(),
  
  // Current State
  current_stock: model.number(),
  current_sales_velocity: model.number(),
  current_profit_margin: model.number(),
  
  // Promotion Data
  has_active_promotion: model.boolean().default(false),
  promotion_details: model.text(), // JSON string of promotion details
  
  // Status
  is_implemented: model.boolean().default(false),
  implemented_at: model.text(),
})

export default RestockRecommendation 