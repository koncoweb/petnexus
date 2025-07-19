import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../modules/supplier"

const createRestockOrderSchema = z.object({
  supplier_id: z.string(),
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

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = req.scope.resolve("query")

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const { data: restock_orders, metadata } = await query.graph({
      entity: "restock_order",
      fields: ["*"],
      filters: where,
      pagination: {
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        order: { created_at: "desc" },
      },
    })

    res.json({
      restock_orders,
      count: metadata?.count || 0,
      page: Number(page),
      limit: Number(limit),
    })
  } catch (error) {
    console.error("Error fetching restock orders:", error)
    res.status(500).json({ error: "Failed to fetch restock orders" })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const data = createRestockOrderSchema.parse(req.body)

    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    // Create the restock order
    const order = await supplierService.createRestockOrder({
      supplier_id: data.supplier_id,
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