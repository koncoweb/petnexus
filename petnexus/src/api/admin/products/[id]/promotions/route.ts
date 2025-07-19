import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUPPLIER_MODULE } from "../../../../../modules/supplier"
import SupplierModuleService from "../../../../../modules/supplier/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id: productId } = req.params
    const { variant_id } = req.query
    const supplierService: SupplierModuleService = req.scope.resolve(SUPPLIER_MODULE)
    
    const promotions = await supplierService.getProductPromotions(
      productId, 
      variant_id as string
    )
    
    res.json({
      product_id: productId,
      variant_id: variant_id || null,
      promotions,
      count: promotions.length,
    })
  } catch (error) {
    console.error("Error fetching product promotions:", error)
    res.status(500).json({ 
      error: "Failed to fetch product promotions",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 