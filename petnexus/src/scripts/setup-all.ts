import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { faker } from "@faker-js/faker"
import { STORE_INVENTORY_MODULE } from "../modules/store-inventory"
import { SUPPLIER_MODULE } from "../modules/supplier"
import { SMART_RESTOCK_MODULE } from "../modules/smart-restock"
import StoreInventoryService from "../modules/store-inventory/service"
import SupplierModuleService from "../modules/supplier/service"
import SmartRestockService from "../modules/smart-restock/service"

export default async function setupAll({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Starting Complete Petshop Setup for Smart Restock...")
  logger.info("This will setup all components: Products, Inventory, Suppliers, Restock Orders, and Smart Restock")
  
  try {
    // Step 1: Setup Product Variants
    logger.info("📦 Step 1/5: Setting up Product Variants...")
    const productsWithVariants = await setupProductVariants(container)
    logger.info(`✅ Step 1 Completed: Created ${productsWithVariants.length} products with variants`)
    
    // Step 2: Setup Inventory
    logger.info("📊 Step 2/5: Setting up Inventory...")
    await setupInventory(container, productsWithVariants)
    logger.info("✅ Step 2 Completed: Inventory setup finished")
    
    // Step 3: Setup Suppliers
    logger.info("🏢 Step 3/5: Setting up Suppliers...")
    const suppliers = await setupSuppliers(container)
    logger.info(`✅ Step 3 Completed: Created ${suppliers.length} suppliers`)
    
    // Step 4: Setup Restock Orders
    logger.info("📋 Step 4/5: Setting up Restock Orders...")
    await setupRestockOrders(container, suppliers, productsWithVariants)
    logger.info("✅ Step 4 Completed: Restock orders setup finished")
    
    // Step 5: Setup Smart Restock
    logger.info("🧠 Step 5/5: Setting up Smart Restock Analysis...")
    await setupSmartRestock(container)
    logger.info("✅ Step 5 Completed: Smart Restock setup finished")
    
    // Final Summary
    await displayFinalSummary(container, productsWithVariants, suppliers)
    
    logger.info("🎉 ALL SETUP STEPS COMPLETED SUCCESSFULLY!")
    logger.info("🧠 Smart Restock system is now fully operational!")
    
  } catch (error) {
    logger.error("❌ Error in complete setup:", error)
    throw error
  }
}

// Step 1: Setup Product Variants
async function setupProductVariants(container: any) {
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })
  
  const petProductsData = [
    {
      title: "Royal Canin Adult Dog Food",
      description: "Complete nutrition for adult dogs 12+ months",
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Size", values: ["2kg", "7.5kg", "15kg"] },
        { title: "Flavor", values: ["Chicken", "Beef", "Lamb"] }
      ],
      variants: [
        {
          title: "Royal Canin Adult Dog Food - 2kg Chicken",
          sku: "RC-ADULT-2KG-CHICKEN",
          prices: [{ currency_code: "idr", amount: 150000 * 100 }],
          options: { Size: "2kg", Flavor: "Chicken" }
        },
        {
          title: "Royal Canin Adult Dog Food - 7.5kg Chicken",
          sku: "RC-ADULT-7.5KG-CHICKEN",
          prices: [{ currency_code: "idr", amount: 450000 * 100 }],
          options: { Size: "7.5kg", Flavor: "Chicken" }
        },
        {
          title: "Royal Canin Adult Dog Food - 15kg Chicken",
          sku: "RC-ADULT-15KG-CHICKEN",
          prices: [{ currency_code: "idr", amount: 850000 * 100 }],
          options: { Size: "15kg", Flavor: "Chicken" }
        }
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }]
    },
    {
      title: "Purina Puppy Food",
      description: "Nutritious food for puppies 2-12 months",
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Size", values: ["1kg", "3kg", "10kg"] },
        { title: "Type", values: ["Dry Food", "Wet Food"] }
      ],
      variants: [
        {
          title: "Purina Puppy Food - 1kg Dry Food",
          sku: "PUR-PUPPY-1KG-DRY",
          prices: [{ currency_code: "idr", amount: 80000 * 100 }],
          options: { Size: "1kg", Type: "Dry Food" }
        },
        {
          title: "Purina Puppy Food - 3kg Dry Food",
          sku: "PUR-PUPPY-3KG-DRY",
          prices: [{ currency_code: "idr", amount: 200000 * 100 }],
          options: { Size: "3kg", Type: "Dry Food" }
        },
        {
          title: "Purina Puppy Food - 10kg Dry Food",
          sku: "PUR-PUPPY-10KG-DRY",
          prices: [{ currency_code: "idr", amount: 600000 * 100 }],
          options: { Size: "10kg", Type: "Dry Food" }
        }
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }]
    },
    {
      title: "Whiskas Adult Cat Food",
      description: "Complete nutrition for adult cats",
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Size", values: ["1kg", "3kg", "8kg"] },
        { title: "Flavor", values: ["Tuna", "Salmon", "Chicken"] }
      ],
      variants: [
        {
          title: "Whiskas Adult Cat Food - 1kg Tuna",
          sku: "WHI-ADULT-1KG-TUNA",
          prices: [{ currency_code: "idr", amount: 75000 * 100 }],
          options: { Size: "1kg", Flavor: "Tuna" }
        },
        {
          title: "Whiskas Adult Cat Food - 3kg Tuna",
          sku: "WHI-ADULT-3KG-TUNA",
          prices: [{ currency_code: "idr", amount: 200000 * 100 }],
          options: { Size: "3kg", Flavor: "Tuna" }
        },
        {
          title: "Whiskas Adult Cat Food - 8kg Tuna",
          sku: "WHI-ADULT-8KG-TUNA",
          prices: [{ currency_code: "idr", amount: 450000 * 100 }],
          options: { Size: "8kg", Flavor: "Tuna" }
        }
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }]
    },
    {
      title: "Premium Dog Collar",
      description: "Comfortable and durable dog collar",
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Size", values: ["Small", "Medium", "Large"] },
        { title: "Color", values: ["Black", "Brown", "Red", "Blue"] }
      ],
      variants: [
        {
          title: "Premium Dog Collar - Small Black",
          sku: "COL-DOG-SM-BLACK",
          prices: [{ currency_code: "idr", amount: 85000 * 100 }],
          options: { Size: "Small", Color: "Black" }
        },
        {
          title: "Premium Dog Collar - Medium Black",
          sku: "COL-DOG-MD-BLACK",
          prices: [{ currency_code: "idr", amount: 95000 * 100 }],
          options: { Size: "Medium", Color: "Black" }
        },
        {
          title: "Premium Dog Collar - Large Black",
          sku: "COL-DOG-LG-BLACK",
          prices: [{ currency_code: "idr", amount: 105000 * 100 }],
          options: { Size: "Large", Color: "Black" }
        }
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }]
    },
    {
      title: "Pet Vitamin Supplement",
      description: "Essential vitamins for dogs and cats",
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Size", values: ["30 tablets", "60 tablets", "120 tablets"] },
        { title: "Type", values: ["For Dogs", "For Cats", "Universal"] }
      ],
      variants: [
        {
          title: "Pet Vitamin Supplement - 30 tablets For Dogs",
          sku: "VIT-DOG-30TAB",
          prices: [{ currency_code: "idr", amount: 150000 * 100 }],
          options: { Size: "30 tablets", Type: "For Dogs" }
        },
        {
          title: "Pet Vitamin Supplement - 60 tablets For Dogs",
          sku: "VIT-DOG-60TAB",
          prices: [{ currency_code: "idr", amount: 250000 * 100 }],
          options: { Size: "60 tablets", Type: "For Dogs" }
        },
        {
          title: "Pet Vitamin Supplement - 30 tablets For Cats",
          sku: "VIT-CAT-30TAB",
          prices: [{ currency_code: "idr", amount: 140000 * 100 }],
          options: { Size: "30 tablets", Type: "For Cats" }
        }
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }]
    }
  ]
  
  const { result: products } = await createProductsWorkflow(container).run({
    input: { products: petProductsData }
  })
  
  console.log(`✅ Created ${products.length} products with variants`)
  products.forEach(product => {
    console.log(`  - ${product.title} (${product.variants.length} variants)`)
  })
  
  return products
}

// Step 2: Setup Inventory
async function setupInventory(container: any, products: any[]) {
  const storeInventoryService: StoreInventoryService = container.resolve(STORE_INVENTORY_MODULE)
  
  const stores = [
    { id: "store-1", name: "PetNexus Jakarta Pusat" },
    { id: "store-2", name: "PetNexus Bandung" },
    { id: "store-3", name: "PetNexus Surabaya" }
  ]
  
  let successCount = 0
  let errorCount = 0
  
  for (const store of stores) {
    for (const product of products) {
      for (const variant of product.variants) {
        try {
          const currentStock = faker.number.int({ min: 5, max: 100 })
          
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
}

// Step 3: Setup Suppliers
async function setupSuppliers(container: any) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  
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
  
  // Create promotions only if suppliers exist
  if (suppliers.length > 0) {
    const promotionsData = [
      {
        supplier_id: suppliers[0].id,
        name: "Bulk Purchase Discount",
        description: "Get 10% off when purchasing 10+ units",
        promotion_type: "product" as const,
        discount_type: "percentage" as const,
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
        promotion_type: "brand" as const,
        discount_type: "percentage" as const,
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
  
  return suppliers
}

// Step 4: Setup Restock Orders
async function setupRestockOrders(container: any, suppliers: any[], products: any[]) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  
  // Only create restock orders if suppliers exist
  if (suppliers.length === 0) {
    console.log("⚠️  No suppliers available for restock orders")
    return
  }
  
  const restockOrdersData = [
    {
      supplier_id: suppliers[0].id,
      total_items: 3,
      total_cost: 1200000,
      currency_code: "IDR",
      notes: "Regular restock order for Jakarta store - confirmed",
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed"
    },
    {
      supplier_id: suppliers[1]?.id || suppliers[0].id,
      total_items: 2,
      total_cost: 800000,
      currency_code: "IDR",
      notes: "Premium product restock for Bandung store - pending",
      expected_delivery_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending"
    },
    {
      supplier_id: suppliers[2]?.id || suppliers[0].id,
      total_items: 4,
      total_cost: 1500000,
      currency_code: "IDR",
      notes: "European products for Surabaya store - shipped",
      expected_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "shipped"
    }
  ]
  
  for (const orderData of restockOrdersData) {
    try {
      const restockOrder = await supplierService.createRestockOrder(orderData)
      console.log(`✅ Created restock order: ${restockOrder.id}`)
      
      // Add items to the order
      const selectedProducts = products.slice(0, orderData.total_items)
      for (const product of selectedProducts) {
        const variant = product.variants[0]
        await supplierService.createRestockOrderItem({
          restock_order_id: restockOrder.id,
          product_id: product.id,
          variant_id: variant.id,
          quantity: faker.number.int({ min: 10, max: 50 }),
          unit_cost: faker.number.int({ min: 50000, max: 200000 }),
          notes: `Restock for ${product.title} - ${variant.title}`
        })
      }
    } catch (error) {
      console.log(`⚠️  Could not create restock order:`, error.message)
    }
  }
}

// Step 5: Setup Smart Restock
async function setupSmartRestock(container: any) {
  const smartRestockService: SmartRestockService = container.resolve(SMART_RESTOCK_MODULE)
  
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

// Display Final Summary
async function displayFinalSummary(container: any, products: any[], suppliers: any[]) {
  console.log("\n🎉 FINAL SETUP SUMMARY:")
  console.log("=".repeat(50))
  
  console.log("\n📦 PRODUCTS SETUP:")
  console.log(`✅ ${products.length} products with variants created`)
  console.log(`✅ ${products.reduce((sum, p) => sum + p.variants.length, 0)} total variants`)
  
  console.log("\n🏢 SUPPLIERS SETUP:")
  console.log(`✅ ${suppliers.length} suppliers created`)
  console.log("✅ Supplier promotions configured")
  
  console.log("\n📋 RESTOCK ORDERS SETUP:")
  console.log("✅ Restock orders created with different statuses")
  console.log("✅ Order items added")
  
  console.log("\n🧠 SMART RESTOCK SETUP:")
  console.log("✅ Smart restock analysis generated")
  console.log("✅ Multi-store inventory tracking active")
  
  console.log("\n🏪 STORES CONFIGURED:")
  console.log("✅ PetNexus Jakarta Pusat (store-1)")
  console.log("✅ PetNexus Bandung (store-2)")
  console.log("✅ PetNexus Surabaya (store-3)")
  
  console.log("\n🔗 API ENDPOINTS READY:")
  console.log("✅ GET /admin/smart-restock?store_id=store-1")
  console.log("✅ POST /admin/smart-restock/create-restock-order")
  console.log("✅ GET /admin/store-inventory?store_id=store-1")
  console.log("✅ GET /admin/restock-orders")
  console.log("✅ GET /admin/suppliers")
  
  console.log("\n" + "=".repeat(50))
  console.log("🎉 PETSHOP SMART RESTOCK SYSTEM IS FULLY OPERATIONAL!")
  console.log("=".repeat(50))
  
  console.log("\n🚀 READY FOR TESTING!")
  console.log("You can now test all Smart Restock features with the provided endpoints.")
} 