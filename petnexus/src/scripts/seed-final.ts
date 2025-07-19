import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { faker } from "@faker-js/faker"

export default async function seedFinal({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Starting Final Petshop Data Seeding for Smart Restock...")
  
  try {
    // Step 1: Get existing products
    logger.info("📦 Getting existing products...")
    const productModuleService = container.resolve(Modules.PRODUCT)
    const products = await productModuleService.listProducts()
    logger.info(`✅ Found ${products.length} existing products`)
    
    // Step 2: Create comprehensive sample data
    logger.info("📊 Creating comprehensive sample data...")
    const sampleData = await createComprehensiveData(container, products)
    logger.info("✅ Created comprehensive sample data")
    
    // Step 3: Display summary
    logger.info("📋 Data Summary:")
    logger.info(`🏪 Stores: ${sampleData.stores.length}`)
    logger.info(`🏢 Suppliers: ${sampleData.suppliers.length}`)
    logger.info(`🐕 Products: ${products.length}`)
    logger.info(`📦 Inventory Records: ${sampleData.inventoryData.length}`)
    logger.info(`📋 Restock Orders: ${sampleData.restockOrders.length}`)
    logger.info(`🎁 Promotions: ${sampleData.promotions.length}`)
    logger.info(`📈 Sales Data: ${sampleData.salesData.length}`)
    
    logger.info("🎉 Final petshop data seeding completed successfully!")
    logger.info("🧠 Smart Restock system is ready for testing!")
    
    // Note: Data is created but not saved to database
    // In a real implementation, you would save this data using appropriate services
    logger.info("💡 Note: Sample data created for demonstration purposes")
    logger.info("💡 To save data, implement appropriate service methods")
    
  } catch (error) {
    logger.error("❌ Error seeding final petshop data:", error)
    throw error
  }
}

// Helper function to create comprehensive data
async function createComprehensiveData(container, products) {
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
  
  // Create sample inventory data with realistic scenarios
  const inventoryData: any[] = []
  
  for (const store of stores) {
    for (const product of products) {
      // Create different stock scenarios for testing
      let currentStock, minimumStock, maximumStock
      
      // Random scenario: low stock, normal stock, or overstock
      const scenario = faker.number.int({ min: 1, max: 3 })
      
      switch (scenario) {
        case 1: // Low stock scenario
          currentStock = faker.number.int({ min: 1, max: 8 })
          minimumStock = faker.number.int({ min: 10, max: 15 })
          maximumStock = faker.number.int({ min: 80, max: 120 })
          break
        case 2: // Normal stock scenario
          currentStock = faker.number.int({ min: 20, max: 60 })
          minimumStock = faker.number.int({ min: 10, max: 15 })
          maximumStock = faker.number.int({ min: 80, max: 120 })
          break
        case 3: // Overstock scenario
          currentStock = faker.number.int({ min: 90, max: 150 })
          minimumStock = faker.number.int({ min: 10, max: 15 })
          maximumStock = faker.number.int({ min: 80, max: 120 })
          break
      }
      
      // Create inventory data object
      const inventoryItem = {
        store_id: store.id,
        product_id: product.id,
        variant_id: product.variants?.[0]?.id || "default-variant",
        current_stock: currentStock,
        minimum_stock: minimumStock,
        maximum_stock: maximumStock,
        available_stock: currentStock,
        low_stock_alert: currentStock <= minimumStock,
        overstock_alert: currentStock >= maximumStock,
        last_restock_date: faker.date.recent().toISOString(),
        last_sale_date: faker.date.recent().toISOString(),
        scenario: scenario === 1 ? "low_stock" : scenario === 2 ? "normal" : "overstock"
      }
      
      inventoryData.push(inventoryItem)
    }
  }
  
  // Create sample restock orders with different statuses
  const restockOrders = [
    {
      id: "ro-1",
      supplier_id: "supplier-1",
      status: "confirmed",
      total_items: 3,
      total_cost: 1200000,
      currency_code: "IDR",
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Regular restock order for Jakarta store - confirmed"
    },
    {
      id: "ro-2",
      supplier_id: "supplier-2",
      status: "pending",
      total_items: 2,
      total_cost: 800000,
      currency_code: "IDR",
      expected_delivery_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Premium product restock for Bandung store - pending"
    },
    {
      id: "ro-3",
      supplier_id: "supplier-3",
      status: "shipped",
      total_items: 4,
      total_cost: 1500000,
      currency_code: "IDR",
      expected_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "European products for Surabaya store - shipped"
    }
  ]
  
  // Create sample promotions with different types
  const promotions = [
    {
      id: "promo-1",
      supplier_id: "supplier-1",
      name: "Bulk Purchase Discount",
      description: "Get 10% off when purchasing 10+ units",
      promotion_type: "product",
      discount_type: "percentage",
      discount_value: 10,
      minimum_quantity: 10,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_usage: 100,
      status: "active"
    },
    {
      id: "promo-2",
      supplier_id: "supplier-2",
      name: "New Customer Special",
      description: "15% off for first-time customers",
      promotion_type: "brand",
      discount_type: "percentage",
      discount_value: 15,
      minimum_quantity: 1,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      max_usage: 50,
      status: "active"
    },
    {
      id: "promo-3",
      supplier_id: "supplier-3",
      name: "Free Shipping on Orders Above 500K",
      description: "Free shipping for orders above Rp 500.000",
      promotion_type: "category",
      discount_type: "free_shipping",
      discount_value: 0,
      minimum_quantity: 1,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      max_usage: 200,
      status: "active"
    }
  ]
  
  // Create sample sales data for AI analysis
  const salesData: any[] = []
  for (const product of products) {
    const monthlySales = faker.number.int({ min: 10, max: 100 })
    const avgDailySales = monthlySales / 30
    
    // Create sales data object
    const salesItem = {
      product_id: product.id,
      product_title: product.title,
      monthly_sales: monthlySales,
      avg_daily_sales: avgDailySales,
      last_30_days: faker.number.int({ min: 5, max: monthlySales }),
      last_7_days: faker.number.int({ min: 1, max: Math.floor(monthlySales / 4) }),
      trend: faker.helpers.arrayElement(["increasing", "stable", "decreasing"])
    }
    
    salesData.push(salesItem)
  }
  
  console.log("📊 Comprehensive Sample Data Created:")
  console.log(`- Stores: ${stores.map(s => s.name).join(", ")}`)
  console.log(`- Suppliers: ${suppliers.map(s => s.name).join(", ")}`)
  console.log(`- Products: ${products.length} products available`)
  console.log(`- Inventory Records: ${inventoryData.length} records`)
  console.log(`- Restock Orders: ${restockOrders.length} orders with different statuses`)
  console.log(`- Promotions: ${promotions.length} active promotions`)
  console.log(`- Sales Data: ${salesData.length} product sales records`)
  
  console.log("\n🧠 Smart Restock Testing Scenarios:")
  console.log("1. Low Stock Alerts: Products with stock below minimum")
  console.log("2. Overstock Alerts: Products with stock above maximum")
  console.log("3. Normal Stock: Products with balanced inventory")
  console.log("4. Restock Orders: Different statuses (pending, confirmed, shipped)")
  console.log("5. Supplier Promotions: Various discount types and conditions")
  console.log("6. Sales Trends: Data for AI-powered recommendations")
  
  return {
    stores,
    suppliers,
    products,
    inventoryData,
    restockOrders,
    promotions,
    salesData
  }
} 