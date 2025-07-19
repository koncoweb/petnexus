import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function verifyVariants({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🔍 Verifying Product Variants...")
  
  try {
    const productModuleService = container.resolve(Modules.PRODUCT)
    const products = await productModuleService.listProducts()
    
    console.log(`\n📦 Found ${products.length} products`)
    
    let productsWithVariants = 0
    let totalVariants = 0
    
    for (const product of products) {
      try {
        // Get variants for this specific product
        const variants = await productModuleService.listProductVariants({
          product_id: product.id
        })
        
        if (variants && variants.length > 0) {
          productsWithVariants++
          totalVariants += variants.length
          
          console.log(`\n✅ ${product.title}:`)
          console.log(`   - Product ID: ${product.id}`)
          console.log(`   - Variants: ${variants.length}`)
          variants.forEach(variant => {
            console.log(`     * ${variant.title} (SKU: ${variant.sku})`)
          })
        } else {
          console.log(`\n⚠️  ${product.title}: No variants found`)
        }
      } catch (error) {
        console.log(`\n❌ ${product.title}: Error checking variants - ${error.message}`)
      }
    }
    
    console.log(`\n📊 VARIANT VERIFICATION SUMMARY:`)
    console.log(`- Total Products: ${products.length}`)
    console.log(`- Products with Variants: ${productsWithVariants}`)
    console.log(`- Products without Variants: ${products.length - productsWithVariants}`)
    console.log(`- Total Variants: ${totalVariants}`)
    
    if (productsWithVariants > 0) {
      console.log(`\n✅ SUCCESS: ${productsWithVariants} products have variants!`)
    } else {
      console.log(`\n⚠️  WARNING: No products have variants`)
    }
    
  } catch (error) {
    logger.error("❌ Error verifying variants:", error)
    throw error
  }
} 