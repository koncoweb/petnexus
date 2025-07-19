import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../../../modules/supplier"

const createItemSchema = z.object({
  product_id: z.string(),
  variant_id: z.string(),
  quantity: z.number().min(1),
  unit_cost: z.number().min(0),
  notes: z.string().optional(),
})

const updateItemSchema = z.object({
  quantity: z.number().min(1).optional(),
  unit_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params
    const data = createItemSchema.parse(req.body)

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const item = await supplierService.createRestockOrderItem({
      restock_order_id: id,
      ...data,
    })

    res.status(201).json({ item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error creating restock order item:", error)
      res.status(500).json({ 
        error: "Failed to create restock order item",
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
    const { id } = req.params

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const items = await supplierService.getRestockOrderItems(id)

    res.json({ items })
  } catch (error) {
    console.error("Error fetching restock order items:", error)
    res.status(500).json({ 
      error: "Failed to fetch restock order items",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 