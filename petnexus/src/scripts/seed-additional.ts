import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { faker } from "@faker-js/faker"
import { STORE_INVENTORY_MODULE } from "../modules/store-inventory"
import { SUPPLIER_MODULE } from "../modules/supplier"
import { SMART_RESTOCK_MODULE } from "../modules/smart-restock"
import StoreInventoryService from "../modules/store-inventory/service"
import SupplierModuleService from "../modules/supplier/service"
import SmartRestockService from "../modules/smart-restock/service"

export default async function seedAdditional({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Starting Additional Petshop Data Seeding...")
  
  try {
    // Resolve services
    const storeInventoryService: StoreInventoryService = container.resolve(STORE_INVENTORY_MODULE)
    const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
    const smartRestockService: SmartRestockService = container.resolve(SMART_RESTOCK_MODULE)
    
    // Step 1: Get existing products
    logger.info("📦 Getting existing products...")
    const productModuleService = container.resolve(Modules.PRODUCT)
    const products = await productModuleService.listProducts()
    logger.info(`✅ Found ${products.length} existing products`)
    
    // Step 2: Create Suppliers
    logger.info("🏢 Creating suppliers...")
    const suppliers = await createSuppliers(supplierService)
    logger.info(`✅ Created ${suppliers.length} suppliers`)
    
    // Step 3: Create Store Inventory
    logger.info("📊 Creating store inventory...")
    await createStoreInventory(storeInventoryService, products)
    logger.info("✅ Created store inventory data")
    
    // Step 4: Create Supplier Promotions
    logger.info("🎁 Creating supplier promotions...")
    await createSupplierPromotions(supplierService, suppliers)
    logger.info("✅ Created supplier promotions")
    
    // Step 5: Create Restock Orders
    logger.info("📋 Creating restock orders...")
    await createRestockOrders(supplierService, suppliers, products)
    logger.info("✅ Created restock orders")
    
    // Step 6: Generate Smart Restock Analysis
    logger.info("🧠 Generating smart restock analysis...")
    await generateSmartRestockAnalysis(smartRestockService)
    logger.info("✅ Generated smart restock analysis")
    
    logger.info("🎉 Additional petshop data seeding finished successfully!")
    
  } catch (error) {
    logger.error("❌ Error seeding additional petshop data:", error)
    throw error
  }
}

// Helper function to create suppliers
async function createSuppliers(supplierService) {
  const suppliersData = [
    {
      company_name: "PT PetFood Indonesia",
      contact_person: "Dewi Sari",
      email: "dewi@petfood-indonesia.com",
      phone: "+62-21-555-0001",
      address: "Jl. Industri No. 100, Jakarta Utara",
      city: "Jakarta",
      country: "Indonesia",
      postal_code: "14140",
      tax_id: "123456789",
      payment_terms: "Net 30",
      status: "active" as const,
      notes: "Leading pet food supplier in Indonesia",
      website: "https://petfood-indonesia.com",
      whatsapp_number: "+62-812-3456-7890",
      auto_restock_enabled: true,
      ai_restock_threshold: 15
    },
    {
      company_name: "Global Pet Supplies Co.",
      contact_person: "Michael Chen",
      email: "michael@globalpetsupplies.com",
      phone: "+1-555-0123",
      address: "123 Pet Street, Los Angeles, CA",
      city: "Los Angeles",
      country: "USA",
      postal_code: "90210",
      tax_id: "987654321",
      payment_terms: "Net 45",
      status: "active" as const,
      notes: "Premium pet supplies from USA",
      website: "https://globalpetsupplies.com",
      whatsapp_number: "+1-555-0123",
      auto_restock_enabled: false,
      ai_restock_threshold: 20
    },
    {
      company_name: "EuroPet Distributors",
      contact_person: "Hans Mueller",
      email: "hans@europet.com",
      phone: "+49-30-555-0123",
      address: "Pet Avenue 456, Berlin",
      city: "Berlin",
      country: "Germany",
      postal_code: "10115",
      tax_id: "DE123456789",
      payment_terms: "Net 30",
      status: "active" as const,
      notes: "European pet brands distributor",
      website: "https://europet.com",
      whatsapp_number: "+49-30-555-0123",
      auto_restock_enabled: true,
      ai_restock_threshold: 12
    }
  ]
  
  const suppliers: any[] = []
  for (const supplierData of suppliersData) {
    try {
      const supplier = await supplierService.createSuppliers(supplierData)
      suppliers.push(supplier)
      console.log(`✅ Created supplier: ${supplierData.company_name}`)
    } catch (error) {
      console.log(`⚠️  Supplier ${supplierData.company_name} might already exist:`, error.message)
    }
  }
  
  return suppliers
}

// Helper function to create store inventory
async function createStoreInventory(storeInventoryService, products) {
  const stores = [
    { id: "store-1", name: "PetNexus Jakarta Pusat" },
    { id: "store-2", name: "PetNexus Bandung" },
    { id: "store-3", name: "PetNexus Surabaya" }
  ]
  
  let successCount = 0
  let errorCount = 0
  
  for (const store of stores) {
    for (const product of products) {
      try {
        const currentStock = faker.number.int({ min: 5, max: 100 })
        
        await storeInventoryService.updateStock(
          store.id,
          product.id,
          product.variants[0].id,
          currentStock,
          "adjustment",
          undefined,
          `Initial stock for ${store.name}`
        )
        successCount++
      } catch (error) {
        console.log(`⚠️  Could not create inventory for ${product.title} in ${store.name}:`, error.message)
        errorCount++
      }
    }
  }
  
  console.log(`📊 Inventory created: ${successCount} successful, ${errorCount} errors`)
}

// Helper function to create supplier promotions
async function createSupplierPromotions(supplierService, suppliers) {
  if (suppliers.length === 0) {
    console.log("No suppliers available for promotions")
    return
  }
  
  const promotionsData = [
    {
      supplier_id: suppliers[0].id,
      name: "Bulk Purchase Discount",
      description: "Get 10% off when purchasing 10+ units",
      promotion_type: "product",
      discount_type: "percentage",
      discount_value: 10,
      minimum_quantity: 10,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_usage: 100,
      terms_conditions: "Valid for bulk purchases only"
    },
    {
      supplier_id: suppliers[1]?.id || suppliers[0].id,
      name: "New Customer Special",
      description: "15% off for first-time customers",
      promotion_type: "brand",
      discount_type: "percentage",
      discount_value: 15,
      minimum_quantity: 1,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      max_usage: 50,
      terms_conditions: "First-time customers only"
    }
  ]
  
  for (const promotionData of promotionsData) {
    try {
      await supplierService.createSupplierPromotion(promotionData)
      console.log(`✅ Created promotion: ${promotionData.name}`)
    } catch (error) {
      console.log(`⚠️  Could not create promotion ${promotionData.name}:`, error.message)
    }
  }
}

// Helper function to create restock orders
async function createRestockOrders(supplierService, suppliers, products) {
  if (suppliers.length === 0 || products.length === 0) {
    console.log("No suppliers or products available for restock orders")
    return
  }
  
  const restockOrdersData = [
    {
      supplier_id: suppliers[0].id,
      total_items: 3,
      total_cost: 1200000,
      currency_code: "IDR",
      notes: "Regular restock order for Jakarta store",
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed"
    },
    {
      supplier_id: suppliers[1]?.id || suppliers[0].id,
      total_items: 2,
      total_cost: 800000,
      currency_code: "IDR",
      notes: "Premium product restock for Bandung store",
      expected_delivery_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending"
    }
  ]
  
  for (const orderData of restockOrdersData) {
    try {
      const restockOrder = await supplierService.createRestockOrder(orderData)
      console.log(`✅ Created restock order: ${restockOrder.id}`)
      
      // Add items to the order
      const selectedProducts = products.slice(0, orderData.total_items)
      for (const product of selectedProducts) {
        await supplierService.createRestockOrderItem({
          restock_order_id: restockOrder.id,
          product_id: product.id,
          variant_id: product.variants[0].id,
          quantity: faker.number.int({ min: 10, max: 50 }),
          unit_cost: faker.number.int({ min: 50000, max: 200000 }),
          notes: `Restock for ${product.title}`
        })
      }
      console.log(`✅ Added ${selectedProducts.length} items to restock order`)
    } catch (error) {
      console.log(`⚠️  Could not create restock order:`, error.message)
    }
  }
}

// Helper function to generate smart restock analysis
async function generateSmartRestockAnalysis(smartRestockService) {
  const stores = ["store-1", "store-2", "store-3"]
  
  for (const storeId of stores) {
    try {
      await smartRestockService.generateSmartRestockAnalysis({ store_id: storeId })
      console.log(`✅ Generated smart restock analysis for ${storeId}`)
    } catch (error) {
      console.log(`⚠️  Could not generate smart restock analysis for ${storeId}:`, error.message)
    }
  }
} 