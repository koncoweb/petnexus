import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

export default async function testBrandsApi({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🧪 Testing Brands API...")
  
  try {
    const brandService: BrandModuleService = container.resolve(BRAND_MODULE)
    
    // Test listBrands method
    logger.info("Testing listBrands method...")
    const [brands, count] = await brandService.listBrands()
    
    console.log("\n📊 BRANDS API TEST RESULTS:")
    console.log(`- Count: ${count}`)
    console.log(`- Brands type: ${typeof brands}`)
    console.log(`- Is Array: ${Array.isArray(brands)}`)
    console.log(`- Brands value:`, brands)
    
    if (Array.isArray(brands)) {
      console.log(`- Array length: ${brands.length}`)
      brands.forEach((brand, index) => {
        console.log(`  ${index + 1}. ${brand.name} (${brand.id})`)
      })
    } else {
      console.log(`- Single brand: ${brands.name} (${brands.id})`)
    }
    
    // Test creating a sample brand if none exist
    if (!brands || (Array.isArray(brands) && brands.length === 0)) {
      logger.info("No brands found, creating a sample brand...")
      
      const sampleBrand = await brandService.createNewBrand({
        name: "Sample Pet Brand",
        description: "A sample brand for testing",
        logo_url: "https://example.com/logo.png",
        website_url: "https://example.com"
      })
      
      console.log("\n✅ Created sample brand:")
      console.log(`- ID: ${sampleBrand.id}`)
      console.log(`- Name: ${sampleBrand.name}`)
      console.log(`- Description: ${sampleBrand.description}`)
    }
    
    logger.info("✅ Brands API test completed!")
    
  } catch (error) {
    logger.error("❌ Error testing brands API:", error)
    throw error
  }
} 