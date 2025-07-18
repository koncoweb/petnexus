import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUPPLIER_MODULE } from "../../../modules/supplier"

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