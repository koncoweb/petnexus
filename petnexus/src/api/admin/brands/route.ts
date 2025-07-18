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