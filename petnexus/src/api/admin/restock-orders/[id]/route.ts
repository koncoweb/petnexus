import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../../modules/supplier"

const updateRestockOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  notes: z.string().optional(),
  expected_delivery_date: z.string().optional(),
})

export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params
    const data = updateRestockOrderSchema.parse(req.body)

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const updatedOrder = await supplierService.updateRestockOrderStatus(id, data.status)

    res.json({ order: updatedOrder })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error updating restock order:", error)
      res.status(500).json({ error: "Failed to update restock order" })
    }
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const order = await supplierService.getRestockOrderById(id)
    const items = await supplierService.getRestockOrderItems(id)

    res.json({ 
      order: {
        ...order,
        items,
      }
    })
  } catch (error) {
    console.error("Error fetching restock order:", error)
    res.status(500).json({ error: "Failed to fetch restock order" })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    // First delete all items associated with this order
    const items = await supplierService.getRestockOrderItems(id)
    for (const item of items) {
      await supplierService.removeRestockOrderItem(item.id)
    }
    
    // Then delete the order itself
    await supplierService.removeRestockOrder(id)

    res.status(204).send()
  } catch (error) {
    console.error("Error deleting restock order:", error)
    res.status(500).json({ 
      error: "Failed to delete restock order",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 