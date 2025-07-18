import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

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

    // For now, return mock updated order
    const updatedOrder = {
      id: orderId,
      supplier_id: id,
      status: data.status,
      total_amount: 1500.00,
      currency_code: "USD",
      notes: data.notes || "Updated order",
      expected_delivery_date: data.expected_delivery_date || "2024-02-15",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: new Date().toISOString(),
      items: [
        {
          id: "roi_1",
          restock_order_id: orderId,
          product_id: "prod_1",
          variant_id: "var_1",
          quantity: 50,
          unit_price: 15.00,
          product_title: "Sample Product",
          variant_title: "Sample Variant",
        }
      ]
    }

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
    const { id, orderId } = req.params

    // For now, return mock order details
    const order = {
      id: orderId,
      supplier_id: id,
      status: "pending",
      total_amount: 1500.00,
      currency_code: "USD",
      notes: "Sample restock order",
      expected_delivery_date: "2024-02-15",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      items: [
        {
          id: "roi_1",
          restock_order_id: orderId,
          product_id: "prod_1",
          variant_id: "var_1",
          quantity: 50,
          unit_price: 15.00,
          product_title: "Sample Product",
          variant_title: "Sample Variant",
        }
      ]
    }

    res.json({ order })
  } catch (error) {
    console.error("Error fetching restock order:", error)
    res.status(500).json({ error: "Failed to fetch restock order" })
  }
} 