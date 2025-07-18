import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import BrandModuleService from "../../../modules/brand/service"
import { BRAND_MODULE } from "../../../modules/brand"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const brandModuleService: BrandModuleService = req.scope.resolve(
      BRAND_MODULE
    )

    const [brands, count] = await brandModuleService.listBrands()

    res.json({
      brands,
      count,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve brands",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
} 