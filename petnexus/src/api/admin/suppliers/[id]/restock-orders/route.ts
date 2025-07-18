import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../../../modules/supplier"

const createRestockOrderSchema = z.object({
  total_items: z.number().min(1, "Total items must be at least 1"),
  total_cost: z.number().min(0, "Total cost must be non-negative"),
  currency_code: z.string().default("USD"),
  notes: z.string().optional(),
  expected_delivery_date: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string(),
    variant_id: z.string(),
    quantity: z.number().min(1),
    unit_cost: z.number().min(0),
    notes: z.string().optional(),
  })).optional(),
})

const updateRestockOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  notes: z.string().optional(),
  expected_delivery_date: z.string().optional(),
})

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params
    const { status } = req.query

    // Resolve the supplier service using the module constant
    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const orders = await supplierService.getSupplierRestockOrders(id, status as string)

    res.json({ orders })
  } catch (error) {
    console.error("Error fetching supplier restock orders:", error)
    res.status(500).json({ 
      error: "Failed to fetch supplier restock orders",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params
    const data = createRestockOrderSchema.parse(req.body)

    // Resolve the supplier service using the module constant
    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    // Create the restock order
    const order = await supplierService.createRestockOrder({
      supplier_id: id,
      total_items: data.total_items,
      total_cost: data.total_cost,
      currency_code: data.currency_code,
      notes: data.notes,
      expected_delivery_date: data.expected_delivery_date,
    })

    // Create order items if provided
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        await supplierService.createRestockOrderItem({
          restock_order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          notes: item.notes,
        })
      }
    }

    res.status(201).json({ order })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error creating restock order:", error)
      res.status(500).json({ 
        error: "Failed to create restock order",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
} 