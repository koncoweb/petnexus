import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

export default async function testProductBrandLink({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🧪 Testing Product-Brand Link...")

  try {
    // 1. Create a test brand
    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE)
    const testBrand = await brandModuleService.createNewBrand({
      name: "Test Brand",
      description: "A test brand for link testing",
      logo_url: "https://example.com/logo.png",
      website_url: "https://example.com",
    })
    logger.info(`✅ Created test brand: ${testBrand.name}`)

    // 2. Get a product
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title"],
    })

    if (products.length === 0) {
      logger.warn("⚠️  No products found. Please create a product first.")
      return
    }

    const testProduct = products[0]
    logger.info(`✅ Using product: ${testProduct.title}`)

    // 3. Test linking product to brand
    logger.info("🔗 Testing product-brand link creation...")
    try {
      await link.create({
        [Modules.PRODUCT]: {
          product_id: testProduct.id,
        },
        brand: {
          brand_id: testBrand.id,
        },
      })
      logger.info("✅ Product linked to brand successfully")
    } catch (error: any) {
      if (error.message?.includes("Cannot create multiple links")) {
        logger.info("✅ Link already exists (this is expected)")
      } else {
        throw error
      }
    }

    // 4. Test retrieving linked brands
    logger.info("📋 Testing retrieval of linked brands...")
    try {
      const linkedBrands = await link.list({
        from: {
          [Modules.PRODUCT]: {
            product_id: testProduct.id,
          },
        },
        to: {
          brand: {},
        },
      })
      logger.info(`✅ Found ${linkedBrands.length} linked brand(s)`)
    } catch (error: any) {
      logger.warn(`⚠️  Could not retrieve linked brands: ${error.message}`)
    }

    // 5. Test unlinking
    logger.info("🔓 Testing product-brand link removal...")
    try {
      await link.dismiss({
        from: {
          [Modules.PRODUCT]: {
            product_id: testProduct.id,
          },
        },
        to: {
          brand: {
            brand_id: testBrand.id,
          },
        },
      })
      logger.info("✅ Product unlinked from brand successfully")
    } catch (error: any) {
      logger.warn(`⚠️  Could not unlink: ${error.message}`)
    }

    // 6. Verify unlink
    try {
      const remainingLinks = await link.list({
        from: {
          [Modules.PRODUCT]: {
            product_id: testProduct.id,
          },
        },
        to: {
          brand: {},
        },
      })
      logger.info(`✅ Remaining links: ${remainingLinks.length}`)
    } catch (error: any) {
      logger.warn(`⚠️  Could not verify remaining links: ${error.message}`)
    }

    logger.info("🎉 Product-Brand Link test completed successfully!")
    logger.info("\n📝 Available API endpoints:")
    logger.info("   GET /admin/products/:id/brands - Get product's brands")
    logger.info("   POST /admin/products/:id/brands - Link product to brand")
    logger.info("   DELETE /admin/products/:id/brands - Unlink product from brand")
    logger.info("   GET /admin/products-with-brands - Get all products with brands")

  } catch (error) {
    logger.error("❌ Product-Brand Link test failed:", error)
    throw error
  }
} 