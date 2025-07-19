import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SMART_RESTOCK_MODULE } from "../../../../modules/smart-restock"
import SmartRestockService from "../../../../modules/smart-restock/service"

const inventoryAnalysisSchema = z.object({
  supplier_id: z.string().optional(),
  store_id: z.string().default("default-store"),
  analysis_period: z.number().min(7).max(365).default(30),
  include_promotions: z.boolean().default(true),
})

const createRestockOrderSchema = z.object({
  supplier_id: z.string(),
  recommendations: z.array(z.any()),
  store_id: z.string(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { supplier_id, store_id = "default-store", analysis_period = 30, include_promotions = true } = req.query

    const smartRestockService: SmartRestockService = req.scope.resolve(SMART_RESTOCK_MODULE)
    
    const analysis = await smartRestockService.generateSmartRestockAnalysis({
      supplier_id: supplier_id as string,
      store_id: store_id as string,
      analysis_period: Number(analysis_period),
      include_promotions: include_promotions === "true",
    })

    res.json(analysis)
  } catch (error) {
    console.error("Error in smart restock inventory analysis:", error)
    res.status(500).json({
      error: "Failed to generate smart restock analysis",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = createRestockOrderSchema.parse(req.body)

    const smartRestockService: SmartRestockService = req.scope.resolve(SMART_RESTOCK_MODULE)
    
    const restockOrder = await smartRestockService.createRestockOrderFromRecommendations({
      supplier_id: data.supplier_id,
      recommendations: data.recommendations,
      store_id: data.store_id,
    })

    res.status(201).json({
      success: true,
      restock_order: restockOrder,
      message: "Restock order created successfully from smart recommendations",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error creating restock order from recommendations:", error)
      res.status(500).json({
        error: "Failed to create restock order",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
} 