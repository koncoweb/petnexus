import { model } from "@medusajs/framework/utils"

const BrandPromotion = model.define("brand_promotion", {
  id: model.id().primaryKey(),
  supplier_promotion_id: model.text(),
  brand_id: model.text(),
  
  // Brand-specific promotion details
  brand_discount_override: model.number(),
  
  // Status
  is_active: model.boolean().default(true),
})

export default BrandPromotion 