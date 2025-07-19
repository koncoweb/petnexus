import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUPPLIER_MODULE } from "../../../../modules/supplier"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const analytics = await supplierService.getRestockOrderAnalytics()

    res.json({ analytics })
  } catch (error) {
    console.error("Error fetching restock order analytics:", error)
    res.status(500).json({ 
      error: "Failed to fetch restock order analytics",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 