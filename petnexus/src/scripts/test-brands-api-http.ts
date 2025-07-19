import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

export default async function testBrandsApiHttp({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🧪 Testing Brands API HTTP Endpoint...")
  
  try {
    const brandService: BrandModuleService = container.resolve(BRAND_MODULE)
    
    // Test the service method directly
    logger.info("Testing service method...")
    const [brands, count] = await brandService.listBrands()
    
    console.log("\n📊 SERVICE METHOD RESULTS:")
    console.log(`- Count: ${count} (type: ${typeof count})`)
    console.log(`- Brands type: ${typeof brands}`)
    console.log(`- Is Array: ${Array.isArray(brands)}`)
    console.log(`- Brands length: ${Array.isArray(brands) ? brands.length : 'N/A'}`)
    
    if (Array.isArray(brands)) {
      brands.forEach((brand, index) => {
        console.log(`  ${index + 1}. ${brand.name} (${brand.id})`)
      })
    } else {
      console.log(`- Single brand: ${brands.name} (${brands.id})`)
    }
    
    // Simulate what the API endpoint should return
    const apiResponse = {
      brands: Array.isArray(brands) ? brands : [brands],
      count: typeof count === 'number' ? count : (Array.isArray(brands) ? brands.length : 1)
    }
    
    console.log("\n📊 API RESPONSE FORMAT:")
    console.log(JSON.stringify(apiResponse, null, 2))
    
    logger.info("✅ Brands API HTTP test completed!")
    
  } catch (error) {
    logger.error("❌ Error testing brands API HTTP:", error)
    throw error
  }
} 