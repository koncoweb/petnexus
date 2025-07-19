import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { faker } from "@faker-js/faker"
import { SUPPLIER_MODULE } from "../modules/supplier"
import SupplierModuleService from "../modules/supplier/service"

export default async function setupStep4RestockOrders({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Step 4: Setting up Restock Orders for Petshop...")
  
  try {
    // Get existing data
    logger.info("📦 Getting existing data...")
    const { suppliers, products } = await getExistingData(container)
    
    if (suppliers.length === 0) {
      logger.info("⚠️  No suppliers found. Please run Step 3 first.")
      return
    }
    
    if (products.length === 0) {
      logger.info("⚠️  No products found. Please run Step 1 first.")
      return
    }
    
    // Create Restock Orders
    logger.info("📋 Creating restock orders...")
    await createRestockOrders(container, suppliers, products)
    logger.info("✅ Created restock orders")
    
    logger.info("✅ Step 4 Completed: Restock orders setup finished")
    
    console.log("\n🔗 NEXT STEPS:")
    console.log("1. Run: npm run setup-step5-smart-restock")
    console.log("2. Test Smart Restock endpoints")
    
  } catch (error) {
    logger.error("❌ Error in Step 4 - Restock Orders Setup:", error)
    throw error
  }
}

// Get existing data
async function getExistingData(container: any) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  const productModuleService = container.resolve(Modules.PRODUCT)
  
  // Get suppliers
  const suppliers = await supplierService.listSuppliers()
  console.log(`📦 Found ${suppliers.length} suppliers`)
  
  // Get products with variants
  const products = await productModuleService.listProducts()
  const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0)
  console.log(`📦 Found ${productsWithVariants.length} products with variants`)
  
  return { suppliers, products: productsWithVariants }
}

// Create Restock Orders
async function createRestockOrders(container: any, suppliers: any[], products: any[]) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  
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
    },
    {
      supplier_id: suppliers[0].id,
      total_items: 2,
      total_cost: 600000,
      currency_code: "IDR",
      notes: "Urgent restock for low stock items - delivered",
      expected_delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "delivered"
    },
    {
      supplier_id: suppliers[1]?.id || suppliers[0].id,
      total_items: 1,
      total_cost: 400000,
      currency_code: "IDR",
      notes: "Special order for premium products - cancelled",
      expected_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "cancelled"
    }
  ]
  
  console.log("\n📋 CREATING RESTOCK ORDERS:")
  for (const orderData of restockOrdersData) {
    try {
      const restockOrder = await supplierService.createRestockOrder(orderData)
      console.log(`✅ Created restock order: ${restockOrder.id}`)
      console.log(`   - Supplier: ${suppliers.find(s => s.id === orderData.supplier_id)?.company_name}`)
      console.log(`   - Status: ${orderData.status}`)
      console.log(`   - Total Cost: Rp ${orderData.total_cost.toLocaleString()}`)
      console.log(`   - Expected Delivery: ${new Date(orderData.expected_delivery_date).toLocaleDateString()}`)
      
      // Add items to the order
      const selectedProducts = products.slice(0, orderData.total_items)
      for (const product of selectedProducts) {
        const variant = product.variants[0] // Use first variant
        const quantity = faker.number.int({ min: 10, max: 50 })
        const unitCost = faker.number.int({ min: 50000, max: 200000 })
        
        await supplierService.createRestockOrderItem({
          restock_order_id: restockOrder.id,
          product_id: product.id,
          variant_id: variant.id,
          quantity: quantity,
          unit_cost: unitCost,
          notes: `Restock for ${product.title} - ${variant.title}`
        })
        
        console.log(`   - Added item: ${product.title} (${quantity} units @ Rp ${unitCost.toLocaleString()})`)
      }
      
    } catch (error) {
      console.log(`⚠️  Could not create restock order:`, error.message)
    }
  }
  
  // Display restock orders summary
  console.log("\n📋 RESTOCK ORDERS SUMMARY:")
  console.log(`- Total orders: ${restockOrdersData.length}`)
  console.log(`- Confirmed orders: ${restockOrdersData.filter(o => o.status === 'confirmed').length}`)
  console.log(`- Pending orders: ${restockOrdersData.filter(o => o.status === 'pending').length}`)
  console.log(`- Shipped orders: ${restockOrdersData.filter(o => o.status === 'shipped').length}`)
  console.log(`- Delivered orders: ${restockOrdersData.filter(o => o.status === 'delivered').length}`)
  console.log(`- Cancelled orders: ${restockOrdersData.filter(o => o.status === 'cancelled').length}`)
  
  const totalValue = restockOrdersData.reduce((sum, order) => sum + order.total_cost, 0)
  console.log(`- Total value: Rp ${totalValue.toLocaleString()}`)
  
  console.log("\n🏢 SUPPLIERS INVOLVED:")
  suppliers.forEach(supplier => {
    const supplierOrders = restockOrdersData.filter(o => o.supplier_id === supplier.id)
    console.log(`  - ${supplier.company_name}: ${supplierOrders.length} orders`)
  })
  
  console.log("\n📦 PRODUCTS INVOLVED:")
  products.forEach(product => {
    console.log(`  - ${product.title} (${product.variants.length} variants)`)
  })
} 