import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import BrandModuleService from "../../../../modules/brand/service"
import { BRAND_MODULE } from "../../../../modules/brand"
import updateBrandWorkflow from "../../../../workflows/update-brand"
import { updateBrandSchema, brandIdSchema, type UpdateBrandInput } from "../schemas"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Validate ID parameter
    const { id } = brandIdSchema.parse(req.params)

    const brandModuleService: BrandModuleService = req.scope.resolve(
      BRAND_MODULE
    )

    const brand = await brandModuleService.getBrandById(id)

    res.json({
      brand,
    })
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Invalid brand ID",
        details: error.errors,
      })
    } else {
      res.status(404).json({
        error: "Brand not found",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}

export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Validate ID parameter
    const { id } = brandIdSchema.parse(req.params)
    
    // Validate update data
    const validatedData = updateBrandSchema.parse(req.body) as UpdateBrandInput

    const { result } = await updateBrandWorkflow(req.scope).run({
      input: {
        id,
        ...validatedData,
      },
    })

    res.json({
      brand: result.brand,
      message: "Brand updated successfully",
    })
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      })
    } else {
      res.status(500).json({
        error: "Failed to update brand",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Validate ID parameter
    const { id } = brandIdSchema.parse(req.params)

    const brandModuleService: BrandModuleService = req.scope.resolve(
      BRAND_MODULE
    )

    await brandModuleService.deleteBrandById(id)
    
    res.status(204).json({
      message: "Brand deleted successfully",
    })
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Invalid brand ID",
        details: error.errors,
      })
    } else {
      res.status(404).json({
        error: "Brand not found",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
} 