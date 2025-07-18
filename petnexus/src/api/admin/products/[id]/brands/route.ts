import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  try {
    // Get the product's linked brands
    const linkedBrands = await link.list({
      from: {
        [Modules.PRODUCT]: {
          product_id: productId,
        },
      },
      to: {
        [BRAND_MODULE]: {},
      },
    })

    res.json({
      product_id: productId,
      brands: linkedBrands,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve product brands",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const { brand_id } = req.body as { brand_id: string }
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  try {
    // Link the product with the brand
    await link.create({
      [Modules.PRODUCT]: {
        product_id: productId,
      },
      [BRAND_MODULE]: {
        brand_id: brand_id,
      },
    })

    res.json({
      success: true,
      message: "Product linked to brand successfully",
      product_id: productId,
      brand_id: brand_id,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to link product to brand",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const { brand_id } = req.body as { brand_id: string }
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  try {
    // Unlink the product from the brand
    await link.dismiss({
      from: {
        [Modules.PRODUCT]: {
          product_id: productId,
        },
      },
      to: {
        [BRAND_MODULE]: {
          brand_id: brand_id,
        },
      },
    })

    res.json({
      success: true,
      message: "Product unlinked from brand successfully",
      product_id: productId,
      brand_id: brand_id,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to unlink product from brand",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
} 