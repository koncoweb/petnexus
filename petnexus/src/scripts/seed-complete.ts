import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { faker } from "@faker-js/faker"
import { STORE_INVENTORY_MODULE } from "../modules/store-inventory"
import { SUPPLIER_MODULE } from "../modules/supplier"
import { SMART_RESTOCK_MODULE } from "../modules/smart-restock"
import StoreInventoryService from "../modules/store-inventory/service"
import SupplierModuleService from "../modules/supplier/service"
import SmartRestockService from "../modules/smart-restock/service"

export default async function seedComplete({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Starting Complete Petshop Data Seeding...")
  
  try {
    // Resolve services
    const storeInventoryService: StoreInventoryService = container.resolve(STORE_INVENTORY_MODULE)
    const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
    const smartRestockService: SmartRestockService = container.resolve(SMART_RESTOCK_MODULE)
    
    // Step 1: Create Pet Products
    logger.info("🐕 Creating pet products...")
    const products = await createPetProducts(container)
    logger.info(`✅ Created ${products.length} products`)
    
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
    
    logger.info("🎉 Complete petshop data seeding finished successfully!")
    
  } catch (error) {
    logger.error("❌ Error seeding petshop data:", error)
    throw error
  }
}

// Helper function to create pet products
async function createPetProducts(container) {
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })
  
  const petProductsData = [
    // Dog Food Products
    {
      title: "Royal Canin Adult Dog Food",
      description: "Complete nutrition for adult dogs 12+ months",
      status: ProductStatus.PUBLISHED,
      category: "Dog Food",
      subcategory: "Adult",
      weight: "15kg",
      price: 450000,
      sku: "RC-ADULT-15KG",
      barcode: "1234567890123"
    },
    {
      title: "Purina Puppy Food",
      description: "Nutritious food for puppies 2-12 months",
      status: ProductStatus.PUBLISHED,
      category: "Dog Food",
      subcategory: "Puppy",
      weight: "10kg",
      price: 350000,
      sku: "PUR-PUPPY-10KG",
      barcode: "1234567890124"
    },
    {
      title: "Pedigree Senior Dog Food",
      description: "Specialized nutrition for senior dogs 7+ years",
      status: ProductStatus.PUBLISHED,
      category: "Dog Food",
      subcategory: "Senior",
      weight: "12kg",
      price: 400000,
      sku: "PED-SENIOR-12KG",
      barcode: "1234567890125"
    },
    // Cat Food Products
    {
      title: "Whiskas Adult Cat Food",
      description: "Complete nutrition for adult cats",
      status: ProductStatus.PUBLISHED,
      category: "Cat Food",
      subcategory: "Adult",
      weight: "8kg",
      price: 280000,
      sku: "WHI-ADULT-8KG",
      barcode: "1234567890126"
    },
    {
      title: "Fancy Feast Kitten Food",
      description: "Premium nutrition for kittens",
      status: ProductStatus.PUBLISHED,
      category: "Cat Food",
      subcategory: "Kitten",
      weight: "5kg",
      price: 320000,
      sku: "FF-KITTEN-5KG",
      barcode: "1234567890127"
    },
    // Pet Accessories
    {
      title: "Premium Dog Collar",
      description: "Comfortable and durable dog collar",
      status: ProductStatus.PUBLISHED,
      category: "Pet Accessories",
      subcategory: "Collars",
      weight: "0.2kg",
      price: 85000,
      sku: "COL-DOG-PREM",
      barcode: "1234567890128"
    },
    {
      title: "Cat Scratching Post",
      description: "Multi-level cat scratching post with toys",
      status: ProductStatus.PUBLISHED,
      category: "Pet Accessories",
      subcategory: "Toys",
      weight: "3kg",
      price: 250000,
      sku: "SCR-CAT-MULTI",
      barcode: "1234567890129"
    },
    // Pet Health Products
    {
      title: "Pet Vitamin Supplement",
      description: "Essential vitamins for dogs and cats",
      status: ProductStatus.PUBLISHED,
      category: "Pet Health",
      subcategory: "Supplements",
      weight: "0.5kg",
      price: 150000,
      sku: "VIT-PET-ESS",
      barcode: "1234567890130"
    }
  ]
  
  // Create products using Medusa workflow
  const productsData = petProductsData.map(product => ({
    title: product.title,
    description: product.description,
    status: product.status,
    options: [
      {
        title: "Size",
        values: ["Small", "Medium", "Large"]
      }
    ],
    variants: [
      {
        title: `${product.title} - Standard`,
        sku: product.sku,
        prices: [
          {
            currency_code: "idr",
            amount: product.price * 100 // Convert to cents
          }
        ],
        options: {
          Size: "Medium"
        }
      }
    ],
    sales_channels: [
      {
        id: defaultSalesChannel[0].id
      }
    ]
  }))
  
  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: productsData
    }
  })
  
  return products
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
      status: "active",
      rating: 4.5,
      specialties: ["Dog Food", "Cat Food", "Pet Toys"]
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
      status: "active",
      rating: 4.8,
      specialties: ["Premium Pet Food", "Pet Accessories", "Grooming Products"]
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
      status: "active",
      rating: 4.6,
      specialties: ["European Pet Brands", "Organic Pet Food", "Pet Health Products"]
    }
  ]
  
  const suppliers: any[] = []
  for (const supplierData of suppliersData) {
    try {
      const supplier = await supplierService.createSuppliers(supplierData)
      suppliers.push(supplier)
    } catch (error) {
      console.log(`Warning: Could not create supplier ${supplierData.company_name}:`, error.message)
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
      } catch (error) {
        console.log(`Warning: Could not create inventory for ${product.title} in ${store.name}:`, error.message)
      }
    }
  }
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
    } catch (error) {
      console.log(`Warning: Could not create promotion ${promotionData.name}:`, error.message)
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
    } catch (error) {
      console.log(`Warning: Could not create restock order:`, error.message)
    }
  }
}

// Helper function to generate smart restock analysis
async function generateSmartRestockAnalysis(smartRestockService) {
  const stores = ["store-1", "store-2", "store-3"]
  
  for (const storeId of stores) {
    try {
      await smartRestockService.generateSmartRestockAnalysis(storeId)
    } catch (error) {
      console.log(`Warning: Could not generate smart restock analysis for ${storeId}:`, error.message)
    }
  }
} 