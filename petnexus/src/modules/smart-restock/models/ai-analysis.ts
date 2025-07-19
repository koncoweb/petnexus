import { model } from "@medusajs/framework/utils"

const AIAnalysis = model.define("ai_analysis", {
  id: model.id().primaryKey(),
  restock_order_id: model.text(),
  
  // AI Request Data
  request_data: model.text(), // JSON string of data sent to AI
  ai_model: model.text().default("moonshotai/kimi-k2:free"),
  
  // AI Response
  ai_response: model.text(), // JSON string of AI response
  analysis_summary: model.text(),
  
  // Recommendations
  recommended_products: model.text(), // JSON string of recommended products
  priority_scores: model.text(), // JSON string of priority scores
  
  // Status
  status: model.enum(["pending", "processing", "completed", "failed"]).default("pending"),
  confidence_score: model.number().default(0),
  
  // Timestamps
  processed_at: model.text(),
})

export default AIAnalysis 