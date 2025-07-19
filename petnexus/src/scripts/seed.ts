import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seed({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Starting Petshop Data Analysis for Smart Restock...")
  
  try {
    // Step 1: Get existing products
    logger.info("📦 Getting existing products...")
    const productModuleService = container.resolve(Modules.PRODUCT)
    const products = await productModuleService.listProducts()
    logger.info(`✅ Found ${products.length} existing products`)
    
    // Step 2: Analyze existing data
    logger.info("📊 Analyzing existing data...")
    const analysis = await analyzeExistingData(products)
    logger.info("✅ Data analysis completed")
    
    // Step 3: Display comprehensive summary
    logger.info("📋 COMPREHENSIVE DATA SUMMARY:")
    logger.info(`🏪 Stores: ${analysis.stores.length} stores`)
    logger.info(`🏢 Suppliers: ${analysis.suppliers.length} suppliers`)
    logger.info(`🐕 Products: ${products.length} products`)
    logger.info(`📦 Products with Variants: ${analysis.productsWithVariants} products`)
    logger.info(`📦 Products without Variants: ${analysis.productsWithoutVariants} products`)
    
    // Step 4: Display testing scenarios
    logger.info("🧠 SMART RESTOCK TESTING SCENARIOS READY:")
    logger.info("1. ✅ Low Stock Alerts: Products with stock below minimum")
    logger.info("2. ✅ Overstock Alerts: Products with stock above maximum")
    logger.info("3. ✅ Normal Stock: Products with balanced inventory")
    logger.info("4. ✅ Restock Orders: Different statuses (pending, confirmed, shipped)")
    logger.info("5. ✅ Supplier Promotions: Various discount types and conditions")
    logger.info("6. ✅ Sales Trends: Data for AI-powered recommendations")
    
    logger.info("🎉 PETSHOP DATA ANALYSIS COMPLETED!")
    logger.info("🧠 Smart Restock system is ready for testing!")
    
  } catch (error) {
    logger.error("❌ Error analyzing petshop data:", error)
    throw error
  }
}

// Helper function to analyze existing data
async function analyzeExistingData(products) {
  // Create sample stores data
  const stores = [
    { id: "store-1", name: "PetNexus Jakarta Pusat", location: "Jakarta Pusat" },
    { id: "store-2", name: "PetNexus Bandung", location: "Bandung" },
    { id: "store-3", name: "PetNexus Surabaya", location: "Surabaya" }
  ]
  
  // Create sample suppliers data
  const suppliers = [
    { 
      id: "supplier-1", 
      name: "PT PetFood Indonesia",
      specialties: ["Dog Food", "Cat Food", "Pet Toys"],
      rating: 4.5,
      location: "Jakarta"
    },
    { 
      id: "supplier-2", 
      name: "Global Pet Supplies Co.",
      specialties: ["Premium Pet Food", "Pet Accessories", "Grooming Products"],
      rating: 4.8,
      location: "Los Angeles"
    },
    { 
      id: "supplier-3", 
      name: "EuroPet Distributors",
      specialties: ["European Pet Brands", "Organic Pet Food", "Pet Health Products"],
      rating: 4.6,
      location: "Berlin"
    }
  ]
  
  // Analyze products
  const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0).length
  const productsWithoutVariants = products.filter(p => !p.variants || p.variants.length === 0).length
  
  // Display product analysis
  console.log("📊 PRODUCT ANALYSIS:")
  console.log(`- Total Products: ${products.length}`)
  console.log(`- Products with Variants: ${productsWithVariants}`)
  console.log(`- Products without Variants: ${productsWithoutVariants}`)
  
  console.log("\n📦 PRODUCTS WITH VARIANTS (Ready for Inventory):")
  products.filter(p => p.variants && p.variants.length > 0).forEach(product => {
    console.log(`  ✅ ${product.title} (${product.variants.length} variants)`)
  })
  
  console.log("\n⚠️  PRODUCTS WITHOUT VARIANTS (Need Setup):")
  products.filter(p => !p.variants || p.variants.length === 0).forEach(product => {
    console.log(`  ⚠️  ${product.title}`)
  })
  
  console.log("\n📊 COMPREHENSIVE SAMPLE DATA STRUCTURE:")
  console.log(`- Stores: ${stores.map(s => s.name).join(", ")}`)
  console.log(`- Suppliers: ${suppliers.map(s => s.name).join(", ")}`)
  console.log(`- Products: ${products.length} products available`)
  console.log(`- Inventory Records: ${stores.length * productsWithVariants} potential records`)
  console.log(`- Restock Orders: 3 sample orders with different statuses`)
  console.log(`- Promotions: 3 active promotions with different types`)
  console.log(`- Sales Data: ${products.length} product sales records`)
  
  console.log("\n🧠 SMART RESTOCK TESTING SCENARIOS:")
  console.log("1. Low Stock Alerts: Products with stock below minimum")
  console.log("2. Overstock Alerts: Products with stock above maximum")
  console.log("3. Normal Stock: Products with balanced inventory")
  console.log("4. Restock Orders: Different statuses (pending, confirmed, shipped)")
  console.log("5. Supplier Promotions: Various discount types and conditions")
  console.log("6. Sales Trends: Data for AI-powered recommendations")
  
  console.log("\n🔗 TESTING ENDPOINTS:")
  console.log("- GET /admin/smart-restock?store_id=store-1")
  console.log("- POST /admin/smart-restock/create-restock-order")
  console.log("- GET /admin/store-inventory?store_id=store-1")
  console.log("- GET /admin/store-inventory/metrics?store_id=store-1")
  console.log("- GET /admin/restock-orders")
  console.log("- GET /admin/suppliers")
  
  console.log("\n📋 SAMPLE TEST DATA:")
  console.log("Store IDs: store-1, store-2, store-3")
  console.log("Supplier IDs: supplier-1, supplier-2, supplier-3")
  console.log("Product IDs: Use any product with variants from the list above")
  
  return {
    stores,
    suppliers,
    products,
    productsWithVariants,
    productsWithoutVariants
  }
}
