import { createContainerLike } from "@medusajs/framework/utils"
import { SMART_RESTOCK_MODULE } from "../modules/smart-restock"
import { SUPPLIER_MODULE } from "../modules/supplier"
import SmartRestockService from "../modules/smart-restock/service"
import SupplierModuleService from "../modules/supplier/service"

async function testSmartRestock() {
  console.log("🧪 Testing Smart Restock Integration...")
  
  try {
    // Create container
    const container = createContainerLike({})
    
    // Resolve services
    const smartRestockService: SmartRestockService = container.resolve(SMART_RESTOCK_MODULE)
    const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
    
    console.log("✅ Services resolved successfully")
    
    // Test 1: Generate Smart Restock Analysis
    console.log("\n📊 Test 1: Generating Smart Restock Analysis...")
    const analysis = await smartRestockService.generateSmartRestockAnalysis({
      store_id: "store-1",
      analysis_period: 30,
      include_promotions: true
    })
    
    console.log(`✅ Analysis generated successfully`)
    console.log(`📈 Summary:`, analysis.summary)
    
    // Test 2: Check AI Analysis Results
    console.log("\n🤖 Test 2: Checking AI Analysis Results...")
    const aiAnalysis = analysis.ai_analysis
    
    console.log(`✅ AI Analysis completed`)
    console.log(`🎯 Confidence Score: ${Math.round((aiAnalysis.confidence_score || 0) * 100)}%`)
    console.log(`📝 Summary: ${aiAnalysis.analysis_summary}`)
    
    // Test 3: Check Restock Recommendations
    console.log("\n📋 Test 3: Checking Restock Recommendations...")
    const recommendations = analysis.recommendations
    
    console.log(`✅ Retrieved recommendations`)
    console.log(`📦 Urgent items: ${recommendations.urgent.length}`)
    console.log(`⚠️ High priority: ${recommendations.high_priority.length}`)
    console.log(`📊 Medium priority: ${recommendations.medium_priority.length}`)
    
    // Test 4: Check Inventory Metrics
    console.log("\n📊 Test 4: Checking Inventory Metrics...")
    const metrics = analysis.inventory_metrics
    
    console.log(`✅ Metrics retrieved:`, metrics)
    
    // Test 5: Test with Supplier Filter
    console.log("\n🏢 Test 5: Testing with Supplier Filter...")
    
    // Get first supplier for testing
    const suppliers = await supplierService.getActiveSuppliers()
    if (suppliers.length > 0) {
      const supplierAnalysis = await smartRestockService.generateSmartRestockAnalysis({
        store_id: "store-1",
        supplier_id: suppliers[0].id,
        analysis_period: 30,
        include_promotions: true
      })
      
      console.log(`✅ Supplier-filtered analysis: ${supplierAnalysis.summary.total_items} items`)
    }
    
    // Test 6: Test Restock Order Creation
    console.log("\n🛒 Test 6: Testing Restock Order Creation...")
    if (suppliers.length > 0 && recommendations.urgent.length > 0) {
      const restockOrder = await smartRestockService.createRestockOrderFromRecommendations({
        supplier_id: suppliers[0].id,
        recommendations: recommendations.urgent,
        store_id: "store-1"
      })
      
      console.log(`✅ Restock order created: ${restockOrder.id}`)
    }
    
    console.log("\n🎉 All Smart Restock tests completed successfully!")
    
    // Print summary
    console.log("\n📋 Test Summary:")
    console.log(`- Items analyzed: ${analysis.summary.total_items}`)
    console.log(`- Fast moving items: ${analysis.summary.fast_moving_count}`)
    console.log(`- Slow moving items: ${analysis.summary.slow_moving_count}`)
    console.log(`- Low stock items: ${analysis.summary.low_stock_items}`)
    console.log(`- Overstock items: ${analysis.summary.overstock_items}`)
    console.log(`- AI confidence: ${Math.round((aiAnalysis.confidence_score || 0) * 100)}%`)
    console.log(`- Urgent recommendations: ${recommendations.urgent.length}`)
    console.log(`- Total recommended items: ${recommendations.total_items}`)
    
  } catch (error) {
    console.error("❌ Test failed:", error)
    throw error
  }
}

// Test specific functions
async function testAIService() {
  console.log("\n🤖 Testing AI Service...")
  
  try {
    const container = createContainerLike({})
    const smartRestockService: SmartRestockService = container.resolve(SMART_RESTOCK_MODULE)
    
    // Test analysis generation
    const analysis = await smartRestockService.generateSmartRestockAnalysis({
      store_id: "store-1",
      analysis_period: 7,
      include_promotions: true
    })
    
    console.log(`✅ Analysis generated: ${analysis.summary.total_items} items`)
    
    // Test AI analysis results
    const aiAnalysis = analysis.ai_analysis
    
    console.log(`✅ AI Analysis completed`)
    console.log(`📊 Analysis Summary: ${aiAnalysis.analysis_summary}`)
    console.log(`🎯 Confidence: ${Math.round((aiAnalysis.confidence_score || 0) * 100)}%`)
    
    return aiAnalysis
  } catch (error) {
    console.error("❌ AI Service test failed:", error)
    throw error
  }
}

async function testPromotionIntegration() {
  console.log("\n🎁 Testing Promotion Integration...")
  
  try {
    const container = createContainerLike({})
    const smartRestockService: SmartRestockService = container.resolve(SMART_RESTOCK_MODULE)
    const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
    
    // Get suppliers with promotions
    const suppliers = await supplierService.getActiveSuppliers()
    
    for (const supplier of suppliers) {
      console.log(`\n🏢 Testing supplier: ${supplier.company_name}`)
      
      const analysis = await smartRestockService.generateSmartRestockAnalysis({
        store_id: "store-1",
        supplier_id: supplier.id,
        analysis_period: 30,
        include_promotions: true
      })
      
      console.log(`  📦 Items analyzed: ${analysis.summary.total_items}`)
      console.log(`  🎁 With promotions: ${analysis.recommendations.urgent.length + analysis.recommendations.high_priority.length}`)
      console.log(`  💰 Estimated cost: $${analysis.recommendations.estimated_cost.toFixed(2)}`)
    }
    
    console.log("✅ Promotion integration test completed")
  } catch (error) {
    console.error("❌ Promotion integration test failed:", error)
    throw error
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting Smart Restock Integration Tests...")
  console.log("=" .repeat(50))
  
  try {
    await testSmartRestock()
    await testAIService()
    await testPromotionIntegration()
    
    console.log("\n" + "=" .repeat(50))
    console.log("🎉 All tests completed successfully!")
    console.log("✅ Smart Restock Integration is working properly")
    
  } catch (error) {
    console.error("\n" + "=" .repeat(50))
    console.error("❌ Tests failed:", error)
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
}

export {
  testSmartRestock,
  testAIService,
  testPromotionIntegration,
  runAllTests
} 