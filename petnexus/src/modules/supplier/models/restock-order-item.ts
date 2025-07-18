import { model } from "@medusajs/framework/utils"

const RestockOrderItem = model.define("restock_order_item", {
  id: model.id().primaryKey(),
  restock_order_id: model.text(),
  product_id: model.text(),
  variant_id: model.text(),
  quantity: model.number(),
  unit_cost: model.number(),
  total_cost: model.number(),
  notes: model.text(),
})

export default RestockOrderItem 