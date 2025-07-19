import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { faker } from "@faker-js/faker"
import { STORE_INVENTORY_MODULE } from "../modules/store-inventory"
import StoreInventoryService from "../modules/store-inventory/service"

export default async function setupStep2Inventory({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  logger.info("🚀 Step 2: Setting up Inventory for Petshop...")
  
  try {
    // Step 2.1: Create Inventory Levels
    logger.info("📊 Step 2.1: Creating inventory levels...")
    await createInventoryLevels(container, query)
    logger.info("✅ Created inventory levels")
    
    // Step 2.2: Create Store Inventory Records
    logger.info("🏪 Step 2.2: Creating store inventory records...")
    await createStoreInventoryRecords(container)
    logger.info("✅ Created store inventory records")
    
    logger.info("✅ Step 2 Completed: Inventory setup finished")
    
    console.log("\n🔗 NEXT STEPS:")
    console.log("1. Run: npm run setup-step3-suppliers")
    console.log("2. Run: npm run setup-step4-restock-orders")
    
  } catch (error) {
    logger.error("❌ Error in Step 2 - Inventory Setup:", error)
    throw error
  }
}

// Step 2.1: Create Inventory Levels
async function createInventoryLevels(container: any, query: any) {
  console.log("Creating inventory levels for products...")
  
  try {
    // Get stock locations
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id"],
    })
    
    if (!stockLocations || stockLocations.length === 0) {
      console.log("⚠️  No stock locations found, creating default location...")
      // Create default stock location if none exists
      const { data: defaultLocation } = await query.graph({
        entity: "stock_location",
        fields: ["id"],
        query: {
          name: "Default Location",
          address: "Default Address",
        },
      })
      
      if (!defaultLocation) {
        console.log("⚠️  Could not create default stock location")
        return
      }
    }
    
    // Get inventory items
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    })
    
    if (!inventoryItems || inventoryItems.length === 0) {
      console.log("⚠️  No inventory items found")
      return
    }
    
    // Create inventory levels
    const inventoryLevels = inventoryItems.map((inventoryItem) => ({
      location_id: stockLocations[0].id,
      stocked_quantity: faker.number.int({ min: 50, max: 200 }),
      inventory_item_id: inventoryItem.id,
    }))
    
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels }
    })
    
    console.log(`✅ Created ${inventoryLevels.length} inventory levels`)
    
  } catch (error) {
    console.log("⚠️  Could not create inventory levels:", error.message)
  }
}

// Step 2.2: Create Store Inventory Records
async function createStoreInventoryRecords(container: any) {
  const storeInventoryService: StoreInventoryService = container.resolve(STORE_INVENTORY_MODULE)
  const productModuleService = container.resolve(Modules.PRODUCT)
  
  // Get products with variants
  const products = await productModuleService.listProducts()
  const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0)
  
  if (productsWithVariants.length === 0) {
    console.log("⚠️  No products with variants found. Please run Step 1 first.")
    return
  }
  
  const stores = [
    { id: "store-1", name: "PetNexus Jakarta Pusat" },
    { id: "store-2", name: "PetNexus Bandung" },
    { id: "store-3", name: "PetNexus Surabaya" }
  ]
  
  let successCount = 0
  let errorCount = 0
  
  for (const store of stores) {
    for (const product of productsWithVariants) {
      for (const variant of product.variants) {
        try {
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
          
          await storeInventoryService.updateStock(
            store.id,
            product.id,
            variant.id,
            currentStock,
            "adjustment",
            undefined,
            `Initial stock for ${store.name} - ${variant.title}`
          )
          successCount++
          
        } catch (error) {
          console.log(`⚠️  Could not create inventory for ${product.title} variant in ${store.name}:`, error.message)
          errorCount++
        }
      }
    }
  }
  
  console.log(`📊 Store inventory created: ${successCount} successful, ${errorCount} errors`)
  
  // Display inventory summary
  console.log("\n📦 INVENTORY SUMMARY:")
  console.log(`- Stores: ${stores.length} stores`)
  console.log(`- Products with variants: ${productsWithVariants.length} products`)
  console.log(`- Total inventory records: ${successCount} records`)
  console.log(`- Low stock scenarios: ${Math.floor(successCount / 3)} records`)
  console.log(`- Normal stock scenarios: ${Math.floor(successCount / 3)} records`)
  console.log(`- Overstock scenarios: ${Math.floor(successCount / 3)} records`)
  
  console.log("\n🏪 STORES:")
  stores.forEach(store => {
    console.log(`  - ${store.name} (${store.id})`)
  })
  
  console.log("\n📦 PRODUCTS WITH INVENTORY:")
  productsWithVariants.forEach(product => {
    console.log(`  - ${product.title} (${product.variants.length} variants)`)
  })
} 