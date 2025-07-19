import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { faker } from "@faker-js/faker"
import { SUPPLIER_MODULE } from "../modules/supplier"
import SupplierModuleService from "../modules/supplier/service"

export default async function fixRestockOrders({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🔧 Creating Restock Orders with Dummy Data...")
  
  try {
    // Get suppliers
    const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
    const suppliers = await supplierService.listSuppliers()
    
    if (suppliers.length === 0) {
      logger.info("⚠️  No suppliers found. Please run Step 3 first.")
      return
    }
    
    logger.info(`Found ${suppliers.length} suppliers`)
    
    // Create restock orders with dummy data
    await createDummyRestockOrders(container, suppliers)
    
    logger.info("✅ Restock orders creation completed!")
    
  } catch (error) {
    logger.error("❌ Error creating restock orders:", error)
    throw error
  }
}

async function createDummyRestockOrders(container: any, suppliers: any[]) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  
  // Define dummy product data for restock orders
  const dummyProducts = [
    {
      name: "Royal Canin Adult Dog Food",
      sku: "RC-ADULT-2KG-CHICKEN",
      category: "Pet Food",
      supplier_category: "Premium Dog Food"
    },
    {
      name: "Purina Puppy Food",
      sku: "PUR-PUPPY-1KG-DRY",
      category: "Pet Food",
      supplier_category: "Puppy Food"
    },
    {
      name: "Whiskas Adult Cat Food",
      sku: "WHI-ADULT-1KG-TUNA",
      category: "Pet Food",
      supplier_category: "Cat Food"
    },
    {
      name: "Premium Dog Collar",
      sku: "COL-DOG-SM-BLACK",
      category: "Pet Accessories",
      supplier_category: "Collars & Leashes"
    },
    {
      name: "Pet Vitamin Supplement",
      sku: "VIT-DOG-30TAB",
      category: "Pet Health",
      supplier_category: "Supplements"
    },
    {
      name: "Cat Scratching Post",
      sku: "SCR-CAT-MULTI",
      category: "Pet Accessories",
      supplier_category: "Toys & Furniture"
    }
  ]
  
  const restockOrdersData = [
    {
      supplier_id: suppliers[0].id,
      total_items: 3,
      total_cost: 1200000,
      currency_code: "IDR",
      notes: "Regular restock order for Jakarta store - confirmed",
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
      items: [
        { product_name: "Royal Canin Adult Dog Food", quantity: 50, unit_cost: 150000 },
        { product_name: "Purina Puppy Food", quantity: 30, unit_cost: 80000 },
        { product_name: "Premium Dog Collar", quantity: 25, unit_cost: 85000 }
      ]
    },
    {
      supplier_id: suppliers[1]?.id || suppliers[0].id,
      total_items: 2,
      total_cost: 800000,
      currency_code: "IDR",
      notes: "Premium product restock for Bandung store - pending",
      expected_delivery_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
      items: [
        { product_name: "Whiskas Adult Cat Food", quantity: 40, unit_cost: 75000 },
        { product_name: "Pet Vitamin Supplement", quantity: 20, unit_cost: 150000 }
      ]
    },
    {
      supplier_id: suppliers[2]?.id || suppliers[0].id,
      total_items: 4,
      total_cost: 1500000,
      currency_code: "IDR",
      notes: "European products for Surabaya store - shipped",
      expected_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "shipped",
      items: [
        { product_name: "Royal Canin Adult Dog Food", quantity: 30, unit_cost: 150000 },
        { product_name: "Cat Scratching Post", quantity: 15, unit_cost: 250000 },
        { product_name: "Premium Dog Collar", quantity: 20, unit_cost: 85000 },
        { product_name: "Pet Vitamin Supplement", quantity: 25, unit_cost: 150000 }
      ]
    },
    {
      supplier_id: suppliers[0].id,
      total_items: 2,
      total_cost: 600000,
      currency_code: "IDR",
      notes: "Urgent restock for low stock items - delivered",
      expected_delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "delivered",
      items: [
        { product_name: "Purina Puppy Food", quantity: 25, unit_cost: 80000 },
        { product_name: "Whiskas Adult Cat Food", quantity: 35, unit_cost: 75000 }
      ]
    },
    {
      supplier_id: suppliers[1]?.id || suppliers[0].id,
      total_items: 1,
      total_cost: 400000,
      currency_code: "IDR",
      notes: "Special order for premium products - cancelled",
      expected_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "cancelled",
      items: [
        { product_name: "Pet Vitamin Supplement", quantity: 30, unit_cost: 150000 }
      ]
    }
  ]
  
  console.log("\n📋 CREATING RESTOCK ORDERS:")
  const createdOrders: any[] = []
  
  for (const orderData of restockOrdersData) {
    try {
      // Create restock order with actual_delivery_date for delivered orders
      const restockOrderData: any = {
        supplier_id: orderData.supplier_id,
        total_items: orderData.total_items,
        total_cost: orderData.total_cost,
        currency_code: orderData.currency_code,
        notes: orderData.notes,
        expected_delivery_date: orderData.expected_delivery_date,
        status: orderData.status
      }
      
      // Add actual_delivery_date for delivered orders
      if (orderData.status === 'delivered') {
        restockOrderData.actual_delivery_date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      const restockOrder = await supplierService.createRestockOrder(restockOrderData)
      
      createdOrders.push(restockOrder)
      
      console.log(`✅ Created restock order: ${restockOrder.id}`)
      console.log(`   - Supplier: ${suppliers.find(s => s.id === orderData.supplier_id)?.company_name}`)
      console.log(`   - Status: ${orderData.status}`)
      console.log(`   - Total Cost: Rp ${orderData.total_cost.toLocaleString()}`)
      console.log(`   - Expected Delivery: ${new Date(orderData.expected_delivery_date).toLocaleDateString()}`)
      
      // Create restock order items with dummy data
      for (const itemData of orderData.items) {
        try {
          const dummyProduct = dummyProducts.find(p => p.name === itemData.product_name) || dummyProducts[0]
          
          await supplierService.createRestockOrderItem({
            restock_order_id: restockOrder.id,
            product_id: faker.string.uuid(), // Generate dummy product ID
            variant_id: faker.string.uuid(), // Generate dummy variant ID
            quantity: itemData.quantity,
            unit_cost: itemData.unit_cost,
            notes: `Restock for ${itemData.product_name} - ${dummyProduct.sku}`
          })
          
          console.log(`   - Added item: ${itemData.product_name} (${itemData.quantity} units @ Rp ${itemData.unit_cost.toLocaleString()})`)
          
        } catch (error) {
          console.log(`   ⚠️  Could not add item ${itemData.product_name}: ${error.message}`)
        }
      }
      
    } catch (error) {
      console.log(`⚠️  Could not create restock order: ${error.message}`)
    }
  }
  
  // Display restock orders summary
  console.log("\n📋 RESTOCK ORDERS SUMMARY:")
  console.log(`- Total orders created: ${createdOrders.length}`)
  
  interface StatusCounts {
    confirmed: number
    pending: number
    shipped: number
    delivered: number
    cancelled: number
  }
  
  const statusCounts: StatusCounts = {
    confirmed: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  }
  
  createdOrders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
  })
  
  Object.entries(statusCounts).forEach(([status, count]) => {
    if (count > 0) {
      console.log(`- ${status.toUpperCase()} orders: ${count}`)
    }
  })
  
  const totalValue = createdOrders.reduce((sum, order) => sum + (order.total_cost || 0), 0)
  console.log(`- Total value: Rp ${totalValue.toLocaleString()}`)
  
  console.log("\n🏢 SUPPLIERS INVOLVED:")
  suppliers.forEach(supplier => {
    const supplierOrders = createdOrders.filter(o => o.supplier_id === supplier.id)
    console.log(`  - ${supplier.company_name}: ${supplierOrders.length} orders`)
  })
  
  console.log("\n📦 PRODUCTS INVOLVED:")
  const uniqueProducts = [...new Set(restockOrdersData.flatMap(o => o.items.map(i => i.product_name)))]
  uniqueProducts.forEach(productName => {
    console.log(`  - ${productName}`)
  })
  
  console.log("\n🔗 NEXT STEPS:")
  console.log("1. Test restock order endpoints")
  console.log("2. Run: npm run check-setup (to verify)")
  console.log("3. Test Smart Restock features")
} 