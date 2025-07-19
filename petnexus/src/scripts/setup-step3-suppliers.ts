import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SUPPLIER_MODULE } from "../modules/supplier"
import SupplierModuleService from "../modules/supplier/service"

export default async function setupStep3Suppliers({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Step 3: Setting up Suppliers for Petshop...")
  
  try {
    // Create Suppliers
    logger.info("🏢 Creating suppliers...")
    const suppliers = await createSuppliers(container)
    logger.info(`✅ Created ${suppliers.length} suppliers`)
    
    // Create Promotions
    logger.info("🎁 Creating promotions...")
    await createPromotions(container, suppliers)
    logger.info("✅ Created promotions")
    
    logger.info("✅ Step 3 Completed: Suppliers and promotions setup finished")
    
    console.log("\n🔗 NEXT STEPS:")
    console.log("1. Run: npm run setup-step4-restock-orders")
    console.log("2. Run: npm run setup-step5-smart-restock")
    
  } catch (error) {
    logger.error("❌ Error in Step 3 - Suppliers Setup:", error)
    throw error
  }
}

// Create Suppliers
async function createSuppliers(container: any) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  
  const suppliersData = [
    {
      company_name: "PT PetFood Indonesia",
      contact_person: "Dewi Sari",
      email: "dewi@petfood-indonesia.com",
      phone: "+62-21-555-0001",
      address: "Jl. Industri No. 100, Jakarta Utara",
      city: "Jakarta",
      state: "DKI Jakarta",
      country: "Indonesia",
      postal_code: "14140",
      tax_id: "123456789",
      payment_terms: "Net 30",
      status: "active" as const,
      notes: "Leading pet food supplier in Indonesia",
      website: "https://petfood-indonesia.com",
      whatsapp_number: "+62-812-3456-7890",
      promotion_notification_email: "promotions@petfood-indonesia.com",
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
      state: "California",
      country: "USA",
      postal_code: "90210",
      tax_id: "987654321",
      payment_terms: "Net 45",
      status: "active" as const,
      notes: "Premium pet supplies from USA",
      website: "https://globalpetsupplies.com",
      whatsapp_number: "+1-555-0123",
      promotion_notification_email: "promotions@globalpetsupplies.com",
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
      state: "Berlin",
      country: "Germany",
      postal_code: "10115",
      tax_id: "DE123456789",
      payment_terms: "Net 30",
      status: "active" as const,
      notes: "European pet brands distributor",
      website: "https://europet.com",
      whatsapp_number: "+49-30-555-0123",
      promotion_notification_email: "promotions@europet.com",
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
  
  // Display suppliers summary
  console.log("\n🏢 SUPPLIERS SUMMARY:")
  suppliers.forEach(supplier => {
    console.log(`  - ${supplier.company_name}`)
    console.log(`    Contact: ${supplier.contact_person}`)
    console.log(`    Email: ${supplier.email}`)
    console.log(`    Status: ${supplier.status}`)
    console.log(`    Payment Terms: ${supplier.payment_terms}`)
  })
  
  return suppliers
}

// Create Promotions
async function createPromotions(container: any, suppliers: any[]) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  
  if (suppliers.length === 0) {
    console.log("No suppliers available for promotions")
    return
  }
  
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
    },
    {
      supplier_id: suppliers[2]?.id || suppliers[0].id,
      name: "Free Shipping on Orders Above 500K",
      description: "Free shipping for orders above Rp 500.000",
      promotion_type: "category" as const,
      discount_type: "free_shipping" as const,
      discount_value: 0,
      minimum_quantity: 1,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      max_usage: 200,
      terms_conditions: "Orders above Rp 500.000 only"
    }
  ]
  
  console.log("\n🎁 CREATING PROMOTIONS:")
  for (const promotionData of promotionsData) {
    try {
      await supplierService.createSupplierPromotion(promotionData)
      console.log(`✅ Created promotion: ${promotionData.name}`)
      console.log(`   - Type: ${promotionData.promotion_type}`)
      console.log(`   - Discount: ${promotionData.discount_value}${promotionData.discount_type === 'percentage' ? '%' : ' IDR'}`)
      console.log(`   - Valid until: ${new Date(promotionData.end_date).toLocaleDateString()}`)
    } catch (error) {
      console.log(`⚠️  Could not create promotion ${promotionData.name}:`, error.message)
    }
  }
  
  console.log("\n🎁 PROMOTIONS SUMMARY:")
  console.log(`- Total promotions: ${promotionsData.length}`)
  console.log(`- Product promotions: ${promotionsData.filter(p => p.promotion_type === 'product').length}`)
  console.log(`- Brand promotions: ${promotionsData.filter(p => p.promotion_type === 'brand').length}`)
  console.log(`- Category promotions: ${promotionsData.filter(p => p.promotion_type === 'category').length}`)
} 