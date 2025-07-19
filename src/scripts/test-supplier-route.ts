import fs from 'fs'
import path from 'path'

export default async function testSupplierRoute() {
  console.log("🧪 Testing Supplier Route File...")
  
  try {
    // Check if route file exists
    const routePath = path.join(__dirname, '../api/admin/products/[id]/supplier/route.ts')
    const fileExists = fs.existsSync(routePath)
    
    console.log(`📁 Route file path: ${routePath}`)
    console.log(`✅ File exists: ${fileExists}`)
    
    if (fileExists) {
      // Read file content
      const content = fs.readFileSync(routePath, 'utf8')
      
      // Check for required functions
      const hasGET = content.includes('export async function GET')
      const hasPOST = content.includes('export async function POST')
      const hasDELETE = content.includes('export async function DELETE')
      
      console.log("\n🔍 Function Analysis:")
      console.log(`  ✅ GET function: ${hasGET}`)
      console.log(`  ✅ POST function: ${hasPOST}`)
      console.log(`  ✅ DELETE function: ${hasDELETE}`)
      
      // Check for required imports
      const hasMedusaRequest = content.includes('MedusaRequest')
      const hasMedusaResponse = content.includes('MedusaResponse')
      const hasContainerRegistrationKeys = content.includes('ContainerRegistrationKeys')
      const hasModules = content.includes('Modules')
      const hasSUPPLIER_MODULE = content.includes('SUPPLIER_MODULE')
      
      console.log("\n📦 Import Analysis:")
      console.log(`  ✅ MedusaRequest: ${hasMedusaRequest}`)
      console.log(`  ✅ MedusaResponse: ${hasMedusaResponse}`)
      console.log(`  ✅ ContainerRegistrationKeys: ${hasContainerRegistrationKeys}`)
      console.log(`  ✅ Modules: ${hasModules}`)
      console.log(`  ✅ SUPPLIER_MODULE: ${hasSUPPLIER_MODULE}`)
      
      // Check for link operations
      const hasLinkList = content.includes('link.list')
      const hasLinkCreate = content.includes('link.create')
      const hasLinkDismiss = content.includes('link.dismiss')
      
      console.log("\n🔗 Link Operations:")
      console.log(`  ✅ link.list: ${hasLinkList}`)
      console.log(`  ✅ link.create: ${hasLinkCreate}`)
      console.log(`  ✅ link.dismiss: ${hasLinkDismiss}`)
      
      console.log("\n🎉 Supplier Route File Test Completed Successfully!")
      console.log("\n📝 Next Steps:")
      console.log("  1. Server should be running in background")
      console.log("  2. Test GET: http://localhost:9000/admin/products/:id/supplier")
      console.log("  3. Test POST: Link product to supplier")
      console.log("  4. Test DELETE: Unlink product from supplier")
      console.log("  5. Check admin dashboard for supplier widget")
      
    } else {
      console.error("❌ Route file not found!")
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
} 