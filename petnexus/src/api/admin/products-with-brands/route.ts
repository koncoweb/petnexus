import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../modules/brand"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // Get all products with their linked brands
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle"],
    })

    const productsWithBrands = await Promise.all(
      products.map(async (product: any) => {
        // Get linked brands for each product
        const linkedBrands = await link.list({
          from: {
            [Modules.PRODUCT]: {
              product_id: product.id,
            },
          },
          to: {
            [BRAND_MODULE]: {},
          },
        })

        return {
          ...product,
          brands: linkedBrands,
        }
      })
    )

    res.json({
      products: productsWithBrands,
      count: productsWithBrands.length,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve products with brands",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
} 