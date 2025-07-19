import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../../../../modules/supplier"

const updateRestockOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  notes: z.string().optional(),
  expected_delivery_date: z.string().optional(),
})

export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id, orderId } = req.params
    const data = updateRestockOrderSchema.parse(req.body)

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    // Update the restock order
    const updatedOrder = await supplierService.updateRestockOrderStatus(orderId, data.status)
    
    // If additional fields are provided, update them
    if (data.notes || data.expected_delivery_date) {
      const updateData: any = {}
      if (data.notes) updateData.notes = data.notes
      if (data.expected_delivery_date) updateData.expected_delivery_date = data.expected_delivery_date
      
      await supplierService.updateRestockOrders({ id: orderId, ...updateData })
    }

    // Get the updated order with items
    const order = await supplierService.getRestockOrderById(orderId)
    const items = await supplierService.getRestockOrderItems(orderId)

    res.json({ 
      order: {
        ...order,
        items,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error updating restock order:", error)
      res.status(500).json({ 
        error: "Failed to update restock order",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id, orderId } = req.params

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const order = await supplierService.getRestockOrderById(orderId)
    const items = await supplierService.getRestockOrderItems(orderId)

    res.json({ 
      order: {
        ...order,
        items,
      }
    })
  } catch (error) {
    console.error("Error fetching restock order:", error)
    res.status(500).json({ 
      error: "Failed to fetch restock order",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 