// Workflow types and interfaces
interface WorkflowStepInput {
  [key: string]: any
}

interface WorkflowStepOutput {
  [key: string]: any
}

type WorkflowStepHandler<Input extends WorkflowStepInput, Output extends WorkflowStepOutput> = 
  (input: Input, context: { container: any }) => Promise<Output>

interface WorkflowData {
  [key: string]: any
}

// Mock createWorkflow function for now
function createWorkflow<T extends WorkflowData>(
  config: {
    id: string
    title: string
    description: string
    steps: any[]
  }
): any {
  return {
    ...config,
    execute: async (data: T) => {
      console.log(`Executing workflow: ${config.id}`)
      // Mock implementation
      return data
    }
  }
}
import { SMART_RESTOCK_MODULE } from "../modules/smart-restock"
import { SUPPLIER_MODULE } from "../modules/supplier"
import SmartRestockService from "../modules/smart-restock/service"
import SupplierModuleService from "../modules/supplier/service"

// ===== WORKFLOW TYPES =====

interface SmartRestockWorkflowInput extends WorkflowStepInput {
  supplier_id?: string
  analysis_period: number
  include_promotions: boolean
  include_ai_analysis: boolean
  auto_create_restock_order: boolean
  notification_email?: string
}

interface SmartRestockWorkflowOutput extends WorkflowStepOutput {
  analytics_summary: any
  ai_analysis: any
  recommendations: any
  restock_order?: any
  execution_time: number
  success: boolean
  errors?: string[]
}

// ===== WORKFLOW STEPS =====

const collectAnalyticsStep: WorkflowStepHandler<
  SmartRestockWorkflowInput,
  { analysis: any }
> = async (input, context) => {
  const startTime = Date.now()
  
  try {
    const smartRestockService: SmartRestockService = context.container.resolve(SMART_RESTOCK_MODULE)
    
    const analysis = await smartRestockService.generateSmartRestockAnalysis({
      supplier_id: input.supplier_id,
      store_id: "store-1", // Default store ID - in real implementation, this should be configurable
      analysis_period: input.analysis_period,
      include_promotions: input.include_promotions
    })
    
    console.log(`Analysis generation completed in ${Date.now() - startTime}ms`)
    
    return {
      analysis
    }
  } catch (error) {
    console.error("Error in collectAnalyticsStep:", error)
    throw new Error(`Failed to generate analysis: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

const performAIAnalysisStep: WorkflowStepHandler<
  { analysis: any; include_ai_analysis: boolean },
  { ai_analysis: any }
> = async (input, context) => {
  const startTime = Date.now()
  
  try {
    if (!input.include_ai_analysis) {
      return { ai_analysis: null }
    }
    
    // AI analysis is already included in the analysis result
    const aiAnalysis = input.analysis.ai_analysis
    
    console.log(`AI analysis retrieved in ${Date.now() - startTime}ms`)
    
    return {
      ai_analysis: aiAnalysis
    }
  } catch (error) {
    console.error("Error in performAIAnalysisStep:", error)
    throw new Error(`Failed to get AI analysis: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

const generateRecommendationsStep: WorkflowStepHandler<
  { analysis: any; ai_analysis: any },
  { recommendations: any }
> = async (input, context) => {
  const startTime = Date.now()
  
  try {
    // Recommendations are already included in the analysis result
    const recommendations = input.analysis.recommendations
    
    console.log(`Recommendations retrieved in ${Date.now() - startTime}ms`)
    
    return {
      recommendations
    }
  } catch (error) {
    console.error("Error in generateRecommendationsStep:", error)
    throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

const createRestockOrderStep: WorkflowStepHandler<
  { 
    recommendations: any; 
    supplier_id?: string; 
    auto_create_restock_order: boolean 
  },
  { restock_order: any }
> = async (input, context) => {
  const startTime = Date.now()
  
  try {
    if (!input.auto_create_restock_order || !input.supplier_id) {
      return { restock_order: null }
    }
    
    const smartRestockService: SmartRestockService = context.container.resolve(SMART_RESTOCK_MODULE)
    
    // Filter recommendations that need restocking
    const restockItems = [
      ...input.recommendations.urgent,
      ...input.recommendations.high_priority,
      ...input.recommendations.medium_priority
    ].filter((item: any) => item.recommended_quantity > 0)
    
    if (restockItems.length === 0) {
      console.log("No items require restocking")
      return { restock_order: null }
    }
    
    const restockOrder = await smartRestockService.createRestockOrderFromRecommendations({
      supplier_id: input.supplier_id,
      recommendations: restockItems,
      store_id: "store-1" // Default store ID
    })
    
    console.log(`Restock order created in ${Date.now() - startTime}ms`)
    
    return {
      restock_order: restockOrder
    }
  } catch (error) {
    console.error("Error in createRestockOrderStep:", error)
    throw new Error(`Failed to create restock order: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

const sendNotificationStep: WorkflowStepHandler<
  { 
    analysis: any; 
    ai_analysis: any; 
    recommendations: any; 
    restock_order: any;
    notification_email?: string 
  },
  { notification_sent: boolean }
> = async (input, context) => {
  const startTime = Date.now()
  
  try {
    if (!input.notification_email) {
      return { notification_sent: false }
    }
    
    // In a real implementation, send email notification
    const notificationData = {
      to: input.notification_email,
      subject: "Smart Restock Analysis Complete",
      body: generateNotificationEmail(input),
    }
    
    // Mock email sending for now
    console.log("Sending notification email:", notificationData)
    
    console.log(`Notification sent in ${Date.now() - startTime}ms`)
    
    return {
      notification_sent: true
    }
  } catch (error) {
    console.error("Error in sendNotificationStep:", error)
    // Don't fail the workflow for notification errors
    return { notification_sent: false }
  }
}

// ===== HELPER FUNCTIONS =====

// Note: generateBasicRecommendations function is no longer needed as recommendations come from analysis

function calculateRecommendedQuantity(product: any): number {
  const { sales_velocity, current_stock, category, has_active_promotion } = product
  
  let baseQuantity = 0
  
  switch (category) {
    case "fast_moving_low_stock":
      baseQuantity = Math.ceil(sales_velocity * 7) // 1 week supply
      break
    case "high_profit_potential":
      baseQuantity = Math.ceil(sales_velocity * 10) // 10 days supply
      break
    case "supplier_promotions":
      baseQuantity = Math.ceil(sales_velocity * 14) // 2 weeks supply
      break
    case "regular_restock":
      baseQuantity = Math.ceil(sales_velocity * 5) // 5 days supply
      break
    case "slow_moving_high_stock":
      baseQuantity = 0 // Don't restock slow moving items
      break
    default:
      baseQuantity = Math.ceil(sales_velocity * 7)
  }
  
  // Adjust for current stock
  const adjustedQuantity = Math.max(0, baseQuantity - current_stock)
  
  // Boost quantity for promotions
  if (has_active_promotion) {
    return Math.ceil(adjustedQuantity * 1.5)
  }
  
  return adjustedQuantity
}

function generateReasoning(product: any): string {
  const { category, sales_velocity, profit_margin, has_active_promotion, current_stock } = product
  
  switch (category) {
    case "fast_moving_low_stock":
      return `High sales velocity (${sales_velocity.toFixed(1)} units/day) with low stock (${current_stock} units) - urgent restock needed`
    case "high_profit_potential":
      return `High profit margin (${profit_margin.toFixed(1)}%) with low stock - capitalize on profitability`
    case "supplier_promotions":
      return `Active supplier promotion available - capitalize on promotional opportunity`
    case "slow_moving_high_stock":
      return `Low sales velocity with high stock - consider reducing stock levels`
    case "regular_restock":
      return `Regular restock based on sales velocity (${sales_velocity.toFixed(1)} units/day)`
    default:
      return `Restock recommendation based on current inventory levels`
  }
}

function generateNotificationEmail(data: any): string {
  const { analysis, ai_analysis, recommendations, restock_order } = data
  
  let email = `
    <h2>Smart Restock Analysis Complete</h2>
    
    <h3>Analysis Summary</h3>
    <ul>
      <li>Total Items: ${analysis.summary.total_items}</li>
      <li>Fast Moving: ${analysis.summary.fast_moving_count}</li>
      <li>Slow Moving: ${analysis.summary.slow_moving_count}</li>
      <li>Low Stock: ${analysis.summary.low_stock_items}</li>
      <li>Overstock: ${analysis.summary.overstock_items}</li>
    </ul>
    
    <h3>AI Analysis</h3>
    <p>${ai_analysis?.analysis_summary || "No AI analysis performed"}</p>
    <p>Confidence: ${Math.round((ai_analysis?.confidence_score || 0) * 100)}%</p>
    
    <h3>Recommendations</h3>
    <ul>
      <li>Urgent Items: ${recommendations.urgent.length}</li>
      <li>High Priority: ${recommendations.high_priority.length}</li>
      <li>Medium Priority: ${recommendations.medium_priority.length}</li>
      <li>Total Items: ${recommendations.total_items}</li>
      <li>Estimated Cost: $${recommendations.estimated_cost?.toLocaleString() || 0}</li>
    </ul>
  `
  
  if (restock_order) {
    email += `
      <h3>Restock Order Created</h3>
      <p>Order ID: ${restock_order.id}</p>
      <p>Total Cost: $${restock_order.total_cost}</p>
      <p>Expected Delivery: ${new Date(restock_order.expected_delivery_date).toLocaleDateString()}</p>
    `
  }
  
  return email
}

// ===== WORKFLOW DEFINITION =====

export const smartRestockWorkflow = createWorkflow<
  SmartRestockWorkflowInput & SmartRestockWorkflowOutput
>({
  id: "smart-restock-workflow",
  title: "Smart Restock Analysis",
  description: "AI-powered restock analysis with promotion integration",
  steps: [
    {
      id: "collect-analytics",
      title: "Collect Product Analytics",
      handler: collectAnalyticsStep,
    },
    {
      id: "perform-ai-analysis",
      title: "Perform AI Analysis",
      handler: performAIAnalysisStep,
      dependencies: ["collect-analytics"],
    },
    {
      id: "generate-recommendations",
      title: "Generate Recommendations",
      handler: generateRecommendationsStep,
      dependencies: ["collect-analytics", "perform-ai-analysis"],
    },
    {
      id: "create-restock-order",
      title: "Create Restock Order",
      handler: createRestockOrderStep,
      dependencies: ["generate-recommendations"],
    },
    {
      id: "send-notification",
      title: "Send Notification",
      handler: sendNotificationStep,
      dependencies: ["collect-analytics", "perform-ai-analysis", "generate-recommendations", "create-restock-order"],
    },
  ],
})

export default smartRestockWorkflow 