import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { STORE_INVENTORY_MODULE } from "../modules/store-inventory"
import { SUPPLIER_MODULE } from "../modules/supplier"
import { SMART_RESTOCK_MODULE } from "../modules/smart-restock"
import StoreInventoryService from "../modules/store-inventory/service"
import SupplierModuleService from "../modules/supplier/service"
import SmartRestockService from "../modules/smart-restock/service"

export default async function checkSetup({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🔍 Checking Petshop Smart Restock Setup Status...")
  
  try {
    // Check Products
    logger.info("📦 Checking products...")
    const products = await checkProducts(container)
    
    // Check Suppliers
    logger.info("🏢 Checking suppliers...")
    const suppliers = await checkSuppliers(container)
    
    // Check Store Inventory
    logger.info("🏪 Checking store inventory...")
    const inventory = await checkStoreInventory(container)
    
    // Check Restock Orders
    logger.info("📋 Checking restock orders...")
    const restockOrders = await checkRestockOrders(container)
    
    // Check Smart Restock
    logger.info("🧠 Checking smart restock...")
    const smartRestock = await checkSmartRestock(container)
    
    // Display comprehensive summary
    await displaySetupSummary(products, suppliers, inventory, restockOrders, smartRestock)
    
    logger.info("✅ Setup status check completed!")
    
  } catch (error) {
    logger.error("❌ Error checking setup status:", error)
    throw error
  }
}

// Check Products
async function checkProducts(container: any) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const products = await productModuleService.listProducts()
  
  const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0)
  const productsWithoutVariants = products.filter(p => !p.variants || p.variants.length === 0)
  
  console.log("\n📦 PRODUCTS STATUS:")
  console.log(`- Total Products: ${products.length}`)
  console.log(`- Products with Variants: ${productsWithVariants.length}`)
  console.log(`- Products without Variants: ${productsWithoutVariants.length}`)
  
  if (productsWithVariants.length > 0) {
    console.log("\n✅ Products with Variants (Ready for Inventory):")
    productsWithVariants.forEach(product => {
      console.log(`  - ${product.title} (${product.variants.length} variants)`)
      product.variants.forEach(variant => {
        console.log(`    * ${variant.title} (SKU: ${variant.sku})`)
      })
    })
  }
  
  if (productsWithoutVariants.length > 0) {
    console.log("\n⚠️  Products without Variants (Need Setup):")
    productsWithoutVariants.forEach(product => {
      console.log(`  - ${product.title}`)
    })
  }
  
  return {
    total: products.length,
    withVariants: productsWithVariants.length,
    withoutVariants: productsWithoutVariants.length,
    products: products
  }
}

// Check Suppliers
async function checkSuppliers(container: any) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  
  try {
    const suppliers = await supplierService.listSuppliers()
    
    console.log("\n🏢 SUPPLIERS STATUS:")
    console.log(`- Total Suppliers: ${suppliers.length}`)
    
    if (suppliers.length > 0) {
      console.log("\n✅ Active Suppliers:")
      suppliers.forEach(supplier => {
        console.log(`  - ${supplier.company_name}`)
        console.log(`    Contact: ${supplier.contact_person}`)
        console.log(`    Email: ${supplier.email}`)
        console.log(`    Status: ${supplier.status}`)
        console.log(`    Payment Terms: ${supplier.payment_terms}`)
      })
    } else {
      console.log("\n⚠️  No suppliers found")
    }
    
    return {
      total: suppliers.length,
      suppliers: suppliers
    }
  } catch (error) {
    console.log("\n⚠️  Could not check suppliers:", error.message)
    return {
      total: 0,
      suppliers: []
    }
  }
}

// Check Store Inventory
async function checkStoreInventory(container: any) {
  const storeInventoryService: StoreInventoryService = container.resolve(STORE_INVENTORY_MODULE)
  
  try {
    const stores = [
      { id: "store-1", name: "PetNexus Jakarta Pusat" },
      { id: "store-2", name: "PetNexus Bandung" },
      { id: "store-3", name: "PetNexus Surabaya" }
    ]
    
    console.log("\n🏪 STORE INVENTORY STATUS:")
    console.log(`- Stores configured: ${stores.length}`)
    
    for (const store of stores) {
      try {
        const inventory = await storeInventoryService.getInventoryLevels(store.id)
        console.log(`\n✅ ${store.name} (${store.id}):`)
        console.log(`  - Inventory records: ${inventory?.length || 0}`)
        
        if (inventory && inventory.length > 0) {
          const lowStock = inventory.filter(item => item.low_stock_alert).length
          const overstock = inventory.filter(item => item.overstock_alert).length
          const normal = inventory.length - lowStock - overstock
          
          console.log(`    * Low stock alerts: ${lowStock}`)
          console.log(`    * Normal stock: ${normal}`)
          console.log(`    * Overstock alerts: ${overstock}`)
        }
      } catch (error) {
        console.log(`\n⚠️  ${store.name}: Could not check inventory - ${error.message}`)
      }
    }
    
    return {
      stores: stores.length,
      status: "checked"
    }
  } catch (error) {
    console.log("\n⚠️  Could not check store inventory:", error.message)
    return {
      stores: 0,
      status: "error"
    }
  }
}

// Check Restock Orders
async function checkRestockOrders(container: any) {
  const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
  
  try {
    const restockOrders = await supplierService.listRestockOrders()
    
    console.log("\n📋 RESTOCK ORDERS STATUS:")
    console.log(`- Total Restock Orders: ${restockOrders.length}`)
    
    if (restockOrders.length > 0) {
      const statusCounts = {
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }
      
      restockOrders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
      })
      
      console.log("\n✅ Restock Orders by Status:")
      Object.entries(statusCounts).forEach(([status, count]) => {
        if (count > 0) {
          console.log(`  - ${status.toUpperCase()}: ${count}`)
        }
      })
      
      console.log("\n📋 Recent Orders:")
      restockOrders.slice(0, 5).forEach(order => {
        console.log(`  - Order ${order.id}: ${order.status} (Rp ${order.total_cost?.toLocaleString() || 0})`)
        console.log(`    Notes: ${order.notes}`)
      })
    } else {
      console.log("\n⚠️  No restock orders found")
    }
    
    return {
      total: restockOrders.length,
      orders: restockOrders
    }
  } catch (error) {
    console.log("\n⚠️  Could not check restock orders:", error.message)
    return {
      total: 0,
      orders: []
    }
  }
}

// Check Smart Restock
async function checkSmartRestock(container: any) {
  const smartRestockService: SmartRestockService = container.resolve(SMART_RESTOCK_MODULE)
  
  try {
    const stores = ["store-1", "store-2", "store-3"]
    
    console.log("\n🧠 SMART RESTOCK STATUS:")
    console.log(`- Stores configured: ${stores.length}`)
    
    for (const storeId of stores) {
      try {
        const analysis = await smartRestockService.generateSmartRestockAnalysis({ store_id: storeId })
        console.log(`\n✅ Store ${storeId}: Smart restock analysis available`)
        if (analysis) {
          console.log(`  - Recommendations: ${analysis.recommendations?.total_items || 0}`)
          console.log(`  - Summary: ${analysis.summary?.low_stock_items || 0} low stock items`)
        }
      } catch (error) {
        console.log(`\n⚠️  Store ${storeId}: No smart restock analysis - ${error.message}`)
      }
    }
    
    return {
      stores: stores.length,
      status: "checked"
    }
  } catch (error) {
    console.log("\n⚠️  Could not check smart restock:", error.message)
    return {
      stores: 0,
      status: "error"
    }
  }
}

// Display Setup Summary
async function displaySetupSummary(products: any, suppliers: any, inventory: any, restockOrders: any, smartRestock: any) {
  console.log("\n" + "=".repeat(60))
  console.log("🎉 PETSHOP SMART RESTOCK SETUP STATUS SUMMARY")
  console.log("=".repeat(60))
  
  console.log("\n📊 COMPONENT STATUS:")
  console.log(`📦 Products: ${products.withVariants}/${products.total} ready for inventory`)
  console.log(`🏢 Suppliers: ${suppliers.total} suppliers configured`)
  console.log(`🏪 Store Inventory: ${inventory.stores} stores configured`)
  console.log(`📋 Restock Orders: ${restockOrders.total} orders created`)
  console.log(`🧠 Smart Restock: ${smartRestock.stores} stores analyzed`)
  
  console.log("\n✅ READY COMPONENTS:")
  if (products.withVariants > 0) console.log("✅ Product variants with inventory tracking")
  if (suppliers.total > 0) console.log("✅ Supplier management with promotions")
  if (inventory.stores > 0) console.log("✅ Multi-store inventory management")
  if (restockOrders.total > 0) console.log("✅ Restock order management")
  if (smartRestock.stores > 0) console.log("✅ Smart restock analysis")
  
  console.log("\n⚠️  NEEDS ATTENTION:")
  if (products.withoutVariants > 0) console.log("⚠️  Products without variants need setup")
  if (suppliers.total === 0) console.log("⚠️  No suppliers configured")
  if (inventory.stores === 0) console.log("⚠️  No store inventory configured")
  if (restockOrders.total === 0) console.log("⚠️  No restock orders created")
  if (smartRestock.stores === 0) console.log("⚠️  Smart restock analysis not available")
  
  console.log("\n🔗 TESTING ENDPOINTS:")
  console.log("✅ GET /admin/smart-restock?store_id=store-1")
  console.log("✅ POST /admin/smart-restock/create-restock-order")
  console.log("✅ GET /admin/store-inventory?store_id=store-1")
  console.log("✅ GET /admin/store-inventory/metrics?store_id=store-1")
  console.log("✅ GET /admin/restock-orders")
  console.log("✅ GET /admin/suppliers")
  
  console.log("\n📋 NEXT STEPS:")
  if (products.withoutVariants > 0) {
    console.log("1. Run: npm run setup-step1 (to create product variants)")
  }
  if (suppliers.total === 0) {
    console.log("2. Run: npm run setup-step3 (to create suppliers)")
  }
  if (restockOrders.total === 0) {
    console.log("3. Run: npm run setup-step4 (to create restock orders)")
  }
  if (smartRestock.stores === 0) {
    console.log("4. Run: npm run setup-step5 (to generate smart restock analysis)")
  }
  
  console.log("\n🚀 READY FOR TESTING!")
  console.log("You can now test Smart Restock features with the provided endpoints.")
  console.log("=".repeat(60))
} 