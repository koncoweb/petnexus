import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { SUPPLIER_MODULE } from "../../../../../modules/supplier"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  try {
    const linkedSuppliers = await link.list({
      from: {
        [Modules.PRODUCT]: {
          product_id: productId,
        },
      },
      to: {
        [SUPPLIER_MODULE]: {},
      },
    })

    res.json({
      product_id: productId,
      suppliers: linkedSuppliers,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve product suppliers",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const { supplier_id } = req.body as { supplier_id: string }
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  try {
    await link.create({
      [Modules.PRODUCT]: {
        product_id: productId,
      },
      [SUPPLIER_MODULE]: {
        supplier_id: supplier_id,
      },
    })

    res.json({
      success: true,
      message: "Product linked to supplier successfully",
      product_id: productId,
      supplier_id: supplier_id,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to link product to supplier",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const { supplier_id } = req.body as { supplier_id: string }
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  try {
    await link.dismiss({
      from: {
        [Modules.PRODUCT]: {
          product_id: productId,
        },
      },
      to: {
        [SUPPLIER_MODULE]: {
          supplier_id: supplier_id,
        },
      },
    })

    res.json({
      success: true,
      message: "Product unlinked from supplier successfully",
      product_id: productId,
      supplier_id: supplier_id,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to unlink product from supplier",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
} 