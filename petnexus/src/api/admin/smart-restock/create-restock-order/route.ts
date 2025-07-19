import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../../modules/supplier"
import { SMART_RESTOCK_MODULE } from "../../../../modules/smart-restock"
import SupplierModuleService from "../../../../modules/supplier/service"
import SmartRestockService from "../../../../modules/smart-restock/service"

const createRestockOrderFromSmartRestockSchema = z.object({
  supplier_id: z.string(),
  store_id: z.string(),
  analysis_period: z.number().min(7).max(365).default(30),
  include_promotions: z.boolean().default(true),
  include_ai_analysis: z.boolean().default(true),
  auto_approve: z.boolean().default(false),
  notes: z.string().optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = createRestockOrderFromSmartRestockSchema.parse(req.body)
    
    const supplierService: SupplierModuleService = req.scope.resolve(SUPPLIER_MODULE)
    const smartRestockService: SmartRestockService = req.scope.resolve(SMART_RESTOCK_MODULE)
    
    // Step 1: Generate smart restock analysis
    console.log("📊 Generating smart restock analysis...")
    const analysis = await smartRestockService.generateSmartRestockAnalysis({
      supplier_id: data.supplier_id,
      store_id: data.store_id,
      analysis_period: data.analysis_period,
      include_promotions: data.include_promotions
    })
    
    // Step 2: Get AI analysis results
    console.log("🤖 Getting AI analysis results...")
    const aiAnalysis = analysis.ai_analysis
    
    // Step 3: Get recommendations
    console.log("📋 Getting restock recommendations...")
    const recommendations = analysis.recommendations
    
    // Step 4: Filter recommendations that need restocking
    const restockItems = [
      ...recommendations.urgent,
      ...recommendations.high_priority,
      ...recommendations.medium_priority
    ].filter((rec: any) => rec.recommended_quantity > 0)
    
    if (restockItems.length === 0) {
      return res.status(400).json({
        error: "No items require restocking",
        analytics_summary: analysis.summary,
        ai_analysis: {
          confidence_score: aiAnalysis.confidence_score,
          analysis_summary: aiAnalysis.analysis_summary
        }
      })
    }
    
    // Step 5: Create restock order
    console.log("📦 Creating restock order...")
    const restockOrder = await smartRestockService.createRestockOrderFromRecommendations({
      supplier_id: data.supplier_id,
      recommendations: restockItems,
      store_id: data.store_id
    })
    
    // Step 6: Log successful creation
    console.log(`✅ Restock order created with ${restockItems.length} items`)
    
    res.status(201).json({
      success: true,
      restock_order: restockOrder,
      analytics_summary: analysis.summary,
      ai_analysis: {
        confidence_score: aiAnalysis.confidence_score,
        analysis_summary: aiAnalysis.analysis_summary
      },
      recommendations: {
        total_items: restockItems.length,
        total_quantity: restockItems.reduce((sum: number, item: any) => sum + item.recommended_quantity, 0),
        total_cost: recommendations.estimated_cost,
        categories: {
          urgent: recommendations.urgent.length,
          high_priority: recommendations.high_priority.length,
          medium_priority: recommendations.medium_priority.length,
          low_priority: recommendations.low_priority.length,
        }
      },
      message: "Restock order created successfully from smart restock analysis"
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error creating restock order from smart restock:", error)
      res.status(500).json({ 
        error: "Failed to create restock order from smart restock analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }
} 