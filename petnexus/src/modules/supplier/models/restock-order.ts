import { model } from "@medusajs/framework/utils"

const RestockOrder = model.define("restock_order", {
  id: model.id().primaryKey(),
  supplier_id: model.text(),
  status: model.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending"),
  total_items: model.number().default(0),
  total_cost: model.number().default(0),
  currency_code: model.text().default("USD"),
  notes: model.text(),
  expected_delivery_date: model.text(),
  actual_delivery_date: model.text(),
})

export default RestockOrder 