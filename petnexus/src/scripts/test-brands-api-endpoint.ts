import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

export default async function testBrandsApiEndpoint({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🧪 Testing Brands API Endpoint Response...")
  
  try {
    const brandService: BrandModuleService = container.resolve(BRAND_MODULE)
    
    // Test the service method
    logger.info("Testing service method...")
    const [brands, count] = await brandService.listBrands()
    
    console.log("\n📊 SERVICE METHOD RESULTS:")
    console.log(`- Count: ${count} (type: ${typeof count})`)
    console.log(`- Brands type: ${typeof brands}`)
    console.log(`- Is Array: ${Array.isArray(brands)}`)
    console.log(`- Brands value:`, brands)
    
    // Simulate what the API endpoint should return
    let brandsArray: any[] = []
    let countNumber: number = 0

    // Handle brands
    if (Array.isArray(brands)) {
      brandsArray = brands
    } else if (brands && typeof brands === 'object' && brands.id) {
      // Single brand object
      brandsArray = [brands]
    } else {
      brandsArray = []
    }

    // Handle count
    if (typeof count === 'number') {
      countNumber = count
    } else if (typeof count === 'object' && count !== null) {
      // If count is an object, use array length
      countNumber = brandsArray.length
    } else {
      countNumber = brandsArray.length
    }

    const apiResponse = {
      brands: brandsArray,
      count: countNumber,
    }

    console.log("\n📊 API ENDPOINT RESPONSE:")
    console.log(JSON.stringify(apiResponse, null, 2))
    
    console.log("\n📊 RESPONSE ANALYSIS:")
    console.log(`- Brands array length: ${apiResponse.brands.length}`)
    console.log(`- Count value: ${apiResponse.count} (type: ${typeof apiResponse.count})`)
    console.log(`- Is brands array: ${Array.isArray(apiResponse.brands)}`)
    
    if (apiResponse.brands.length > 0) {
      console.log("\n📋 BRANDS LIST:")
      apiResponse.brands.forEach((brand, index) => {
        console.log(`  ${index + 1}. ${brand.name} (${brand.id})`)
      })
    }
    
    logger.info("✅ Brands API endpoint test completed!")
    
  } catch (error) {
    logger.error("❌ Error testing brands API endpoint:", error)
    throw error
  }
} 