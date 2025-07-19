import { model } from "@medusajs/framework/utils"

const SupplierPromotion = model.define("supplier_promotion", {
  id: model.id().primaryKey(),
  supplier_id: model.text(),
  
  // Promotion Details
  name: model.text(),
  description: model.text(),
  promotion_type: model.enum(["brand", "product", "category"]).default("product"),
  
  // Promotion Rules
  discount_type: model.enum(["percentage", "fixed_amount", "buy_x_get_y", "free_shipping"]).default("percentage"),
  discount_value: model.number(), // percentage or fixed amount
  minimum_quantity: model.number().default(1),
  maximum_quantity: model.number(),
  
  // Buy X Get Y (for buy_x_get_y type)
  buy_quantity: model.number(),
  get_quantity: model.number(),
  
  // Validity Period
  start_date: model.text(),
  end_date: model.text(),
  
  // Status
  status: model.enum(["active", "inactive", "expired", "scheduled"]).default("active"),
  
  // Priority (for overlapping promotions)
  priority: model.number().default(1),
  
  // Usage Limits
  max_usage: model.number(),
  current_usage: model.number().default(0),
  
  // Metadata
  terms_conditions: model.text(),
})

export default SupplierPromotion 