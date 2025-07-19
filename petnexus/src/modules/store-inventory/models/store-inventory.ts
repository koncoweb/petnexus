import { model } from "@medusajs/framework/utils"

const StoreInventory = model.define("store_inventory", {
  id: model.id().primaryKey(),
  store_id: model.text(),
  product_id: model.text(),
  variant_id: model.text(),
  current_stock: model.number().default(0),
  minimum_stock: model.number().default(10),
  maximum_stock: model.number().default(1000),
  reserved_stock: model.number().default(0),
  available_stock: model.number().default(0),
  last_restock_date: model.text(),
  last_sale_date: model.text(),
  stock_turnover_rate: model.number().default(0),
  days_of_inventory: model.number().default(0),
  low_stock_alert: model.boolean().default(false),
  overstock_alert: model.boolean().default(false),
})

export default StoreInventory 