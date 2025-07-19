import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUPPLIER_MODULE } from "../../../../../modules/supplier"
import SupplierModuleService from "../../../../../modules/supplier/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id: brandId } = req.params
    const supplierService: SupplierModuleService = req.scope.resolve(SUPPLIER_MODULE)
    
    const promotions = await supplierService.getBrandPromotions(brandId)
    
    res.json({
      brand_id: brandId,
      promotions,
      count: promotions.length,
    })
  } catch (error) {
    console.error("Error fetching brand promotions:", error)
    res.status(500).json({ 
      error: "Failed to fetch brand promotions",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 