import { Module } from "@medusajs/framework/utils"
import SmartRestockService from "./service"
import { AIAnalysis, RestockRecommendation, ProductAnalytics } from "./models"

export const SMART_RESTOCK_MODULE = "smart_restock"

const smartRestockModule = Module(SMART_RESTOCK_MODULE, {
  service: SmartRestockService,
})

// Export linkable for module links
export const linkable = {
  ai_analysis: {
    service: SmartRestockService,
  },
  restock_recommendation: {
    service: SmartRestockService,
  },
  product_analytics: {
    service: SmartRestockService,
  },
}

export default smartRestockModule 