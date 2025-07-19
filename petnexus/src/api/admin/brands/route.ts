import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import BrandModuleService from "../../../modules/brand/service"
import { BRAND_MODULE } from "../../../modules/brand"
import createBrandSimpleWorkflow from "../../../workflows/create-brand-simple"
import { createBrandSchema, type CreateBrandInput } from "./schemas"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const brandModuleService: BrandModuleService = req.scope.resolve(
      BRAND_MODULE
    )

    const [brands, count] = await brandModuleService.listBrands()

    // Debug logging
    console.log("Service response - brands:", typeof brands, brands)
    console.log("Service response - count:", typeof count, count)

    // Handle different response formats from the service
    let brandsArray: any[] = []
    let countNumber: number = 0

    // Handle brands
    if (Array.isArray(brands)) {
      brandsArray = brands
    } else if (brands && typeof brands === 'object' && brands.id) {
      // Single brand object
      brandsArray = [brands]
    } else {
      brandsArray = []
    }

    // Handle count
    if (typeof count === 'number') {
      countNumber = count
    } else if (typeof count === 'object' && count !== null) {
      // If count is an object, use array length
      countNumber = brandsArray.length
    } else {
      countNumber = brandsArray.length
    }

    const response = {
      brands: brandsArray,
      count: countNumber,
    }

    console.log("API response:", response)

    res.json(response)
  } catch (error) {
    console.error("Brands API error:", error)
    res.status(500).json({
      error: "Failed to retrieve brands",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Validate input using schema
    const validatedData = createBrandSchema.parse(req.body) as CreateBrandInput

    const { result } = await createBrandSimpleWorkflow(req.scope).run({
      input: validatedData,
    })

    res.status(201).json({
      brand: result.brand,
      message: "Brand created successfully",
    })
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      })
    } else {
      res.status(500).json({
        error: "Failed to create brand",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
} 