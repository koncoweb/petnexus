import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../../../../modules/supplier"

const updateItemSchema = z.object({
  quantity: z.number().min(1).optional(),
  unit_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { itemId } = req.params
    const data = updateItemSchema.parse(req.body)

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const updatedItem = await supplierService.updateRestockOrderItem(itemId, data)

    res.json({ item: updatedItem })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error updating restock order item:", error)
      res.status(500).json({ 
        error: "Failed to update restock order item",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { itemId } = req.params

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    await supplierService.removeRestockOrderItem(itemId)

    res.status(204).send()
  } catch (error) {
    console.error("Error deleting restock order item:", error)
    res.status(500).json({ 
      error: "Failed to delete restock order item",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { itemId } = req.params

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const item = await supplierService.retrieveRestockOrderItem(itemId)

    res.json({ item })
  } catch (error) {
    console.error("Error fetching restock order item:", error)
    res.status(500).json({ 
      error: "Failed to fetch restock order item",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 