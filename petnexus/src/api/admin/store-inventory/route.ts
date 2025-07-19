import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { STORE_INVENTORY_MODULE } from "../../../modules/store-inventory"
import StoreInventoryService from "../../../modules/store-inventory/service"

const updateStockSchema = z.object({
  store_id: z.string(),
  product_id: z.string(),
  variant_id: z.string(),
  quantity: z.number(),
  movement_type: z.enum(["restock", "sale", "adjustment", "transfer", "return"]),
  reference_id: z.string().optional(),
  notes: z.string().optional(),
})

const reserveStockSchema = z.object({
  store_id: z.string(),
  product_id: z.string(),
  variant_id: z.string(),
  quantity: z.number(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { store_id, product_ids } = req.query

    const storeInventoryService: StoreInventoryService = req.scope.resolve(STORE_INVENTORY_MODULE)
    
    let productIdsArray: string[] | undefined
    if (product_ids) {
      if (Array.isArray(product_ids)) {
        productIdsArray = product_ids.map(id => String(id))
      } else {
        productIdsArray = [String(product_ids)]
      }
    }

    const inventoryLevels = await storeInventoryService.getInventoryLevels(
      store_id as string,
      productIdsArray
    )

    res.json({
      inventory_levels: inventoryLevels,
      total_items: inventoryLevels.length,
    })
  } catch (error) {
    console.error("Error fetching inventory levels:", error)
    res.status(500).json({
      error: "Failed to fetch inventory levels",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = updateStockSchema.parse(req.body)

    const storeInventoryService: StoreInventoryService = req.scope.resolve(STORE_INVENTORY_MODULE)
    
    const updatedInventory = await storeInventoryService.updateStock(
      data.store_id,
      data.product_id,
      data.variant_id,
      data.quantity,
      data.movement_type,
      data.reference_id,
      data.notes
    )

    res.status(200).json({
      success: true,
      inventory: updatedInventory,
      message: "Stock updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error updating stock:", error)
      res.status(500).json({
        error: "Failed to update stock",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = reserveStockSchema.parse(req.body)

    const storeInventoryService: StoreInventoryService = req.scope.resolve(STORE_INVENTORY_MODULE)
    
    const reservedInventory = await storeInventoryService.reserveStock(
      data.store_id,
      data.product_id,
      data.variant_id,
      data.quantity
    )

    res.status(200).json({
      success: true,
      inventory: reservedInventory,
      message: "Stock reserved successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error reserving stock:", error)
      res.status(500).json({
        error: "Failed to reserve stock",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
} 