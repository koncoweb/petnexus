import { model } from "@medusajs/framework/utils"

const InventoryMovement = model.define("inventory_movement", {
  id: model.id().primaryKey(),
  store_id: model.text(),
  product_id: model.text(),
  variant_id: model.text(),
  movement_type: model.enum(["restock", "sale", "adjustment", "transfer", "return"]),
  quantity: model.number(),
  previous_stock: model.number(),
  new_stock: model.number(),
  reference_id: model.text(),
  reference_type: model.text(),
  notes: model.text(),
  user_id: model.text(),
})

export default InventoryMovement 