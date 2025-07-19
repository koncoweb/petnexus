import { model } from "@medusajs/framework/utils"

const ProductPromotion = model.define("product_promotion", {
  id: model.id().primaryKey(),
  supplier_promotion_id: model.text(),
  product_id: model.text(),
  variant_id: model.text(), // Optional: specific variant promotion
  
  // Product-specific promotion details
  product_discount_override: model.number(),
  product_minimum_quantity: model.number(),
  
  // Status
  is_active: model.boolean().default(true),
})

export default ProductPromotion 