import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../modules/supplier"
import { SMART_RESTOCK_MODULE } from "../../../modules/smart-restock"
import SupplierModuleService from "../../../modules/supplier/service"
import SmartRestockService from "../../../modules/smart-restock/service"

const smartRestockSchema = z.object({
  supplier_id: z.string().optional(),
  store_id: z.string(),
  include_ai_analysis: z.boolean().default(true),
  analysis_period: z.number().min(7).max(365).default(30),
  include_promotions: z.boolean().default(true),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { supplier_id, store_id, period = 30, include_promotions = true } = req.query
    
    if (!store_id) {
      return res.status(400).json({ error: "store_id is required" })
    }
    
    const supplierService: SupplierModuleService = req.scope.resolve(SUPPLIER_MODULE)
    const smartRestockService: SmartRestockService = req.scope.resolve(SMART_RESTOCK_MODULE)
    
    // Generate smart restock analysis
    const analysis = await smartRestockService.generateSmartRestockAnalysis({
      supplier_id: supplier_id as string,
      store_id: store_id as string,
      analysis_period: Number(period),
      include_promotions: include_promotions === "true"
    })
    
    res.json({
      analysis,
      summary: {
        total_items: analysis.summary.total_items,
        fast_moving_count: analysis.summary.fast_moving_count,
        slow_moving_count: analysis.summary.slow_moving_count,
        low_stock_items: analysis.summary.low_stock_items,
        overstock_items: analysis.summary.overstock_items
      }
    })
  } catch (error) {
    console.error("Error fetching smart restock analysis:", error)
    res.status(500).json({ 
      error: "Failed to fetch analysis",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = smartRestockSchema.parse(req.body)
    
    const supplierService: SupplierModuleService = req.scope.resolve(SUPPLIER_MODULE)
    const smartRestockService: SmartRestockService = req.scope.resolve(SMART_RESTOCK_MODULE)
    
    // Generate smart restock analysis
    const analysis = await smartRestockService.generateSmartRestockAnalysis({
      supplier_id: data.supplier_id,
      store_id: data.store_id,
      analysis_period: data.analysis_period,
      include_promotions: data.include_promotions
    })
    
    // Get AI analysis results
    const aiAnalysis = data.include_ai_analysis ? analysis.ai_analysis : null
    
    // Get recommendations
    const recommendations = analysis.recommendations
    
    res.status(201).json({
      success: true,
      analysis,
      ai_analysis: aiAnalysis,
      recommendations,
      message: "Smart restock analysis completed successfully"
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Smart restock error:", error)
      res.status(500).json({ 
        error: "Failed to perform smart restock analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
} 