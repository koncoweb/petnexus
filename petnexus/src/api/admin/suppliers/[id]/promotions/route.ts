import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../../../modules/supplier"
import SupplierModuleService from "../../../../../modules/supplier/service"

const createPromotionSchema = z.object({
  name: z.string().min(1, "Promotion name is required"),
  description: z.string().min(1, "Description is required"),
  promotion_type: z.enum(["brand", "product", "category"]),
  discount_type: z.enum(["percentage", "fixed_amount", "buy_x_get_y", "free_shipping"]),
  discount_value: z.number().min(0, "Discount value must be positive"),
  minimum_quantity: z.number().min(1).optional(),
  maximum_quantity: z.number().min(1).optional(),
  buy_quantity: z.number().min(1).optional(),
  get_quantity: z.number().min(1).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  max_usage: z.number().min(1).optional(),
  terms_conditions: z.string().optional(),
  brand_ids: z.array(z.string()).optional(),
  product_ids: z.array(z.string()).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id: supplierId } = req.params
    const supplierService: SupplierModuleService = req.scope.resolve(SUPPLIER_MODULE)
    
    const promotions = await supplierService.getSupplierActivePromotions(supplierId)
    
    res.json({
      promotions,
      count: promotions.length,
    })
  } catch (error) {
    console.error("Error fetching supplier promotions:", error)
    res.status(500).json({ 
      error: "Failed to fetch promotions",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id: supplierId } = req.params
    const data = createPromotionSchema.parse(req.body)
    const supplierService: SupplierModuleService = req.scope.resolve(SUPPLIER_MODULE)
    
    // Create supplier promotion
    const promotion = await supplierService.createSupplierPromotion({
      ...data,
      supplier_id: supplierId,
      start_date: data.start_date,
      end_date: data.end_date,
    })
    
    // Create brand promotions if specified
    if (data.brand_ids && data.brand_ids.length > 0) {
      await Promise.all(
        data.brand_ids.map(brandId =>
          supplierService.createBrandPromotion({
            supplier_promotion_id: promotion.id,
            brand_id: brandId,
          })
        )
      )
    }
    
    // Create product promotions if specified
    if (data.product_ids && data.product_ids.length > 0) {
      await Promise.all(
        data.product_ids.map(productId =>
          supplierService.createProductPromotion({
            supplier_promotion_id: promotion.id,
            product_id: productId,
          })
        )
      )
    }
    
    res.status(201).json({
      promotion,
      message: "Promotion created successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error creating promotion:", error)
      res.status(500).json({ 
        error: "Failed to create promotion",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
} 