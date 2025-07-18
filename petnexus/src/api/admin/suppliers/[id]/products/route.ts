import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params
    const query = req.scope.resolve("query")

    // For now, return empty array since we don't have product-supplier links implemented yet
    // This will be implemented when we add the product-supplier module link
    res.json({ products: [] })
  } catch (error) {
    console.error("Error fetching supplier products:", error)
    res.status(500).json({ error: "Failed to fetch supplier products" })
  }
} 