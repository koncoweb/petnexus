import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_INVENTORY_MODULE } from "../../../../modules/store-inventory"
import StoreInventoryService from "../../../../modules/store-inventory/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { store_id = "default-store" } = req.query

    const storeInventoryService: StoreInventoryService = req.scope.resolve(STORE_INVENTORY_MODULE)
    
    // Get stock metrics
    const stockMetrics = await storeInventoryService.calculateStockMetrics(store_id as string)
    
    // Get low stock items
    const lowStockItems = await storeInventoryService.getLowStockItems(store_id as string)
    
    // Get overstock items
    const overstockItems = await storeInventoryService.getOverstockItems(store_id as string)

    res.json({
      store_id: store_id,
      metrics: stockMetrics,
      low_stock_items: lowStockItems,
      overstock_items: overstockItems,
      alerts: {
        low_stock_count: lowStockItems.length,
        overstock_count: overstockItems.length,
        total_alerts: lowStockItems.length + overstockItems.length,
      },
    })
  } catch (error) {
    console.error("Error fetching inventory metrics:", error)
    res.status(500).json({
      error: "Failed to fetch inventory metrics",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
} 