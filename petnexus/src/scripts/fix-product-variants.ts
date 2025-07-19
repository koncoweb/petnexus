import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function fixProductVariants({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🔧 Fixing Product Variants Detection and Creation...")
  
  try {
    // Get sales channel
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
    const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    })
    
    // Get existing products
    const productModuleService = container.resolve(Modules.PRODUCT)
    const existingProducts = await productModuleService.listProducts()
    
    logger.info(`Found ${existingProducts.length} existing products`)
    
    // Check which products need variants
    const productsNeedingVariants = existingProducts.filter(p => 
      !p.variants || p.variants.length === 0
    )
    
    logger.info(`Found ${productsNeedingVariants.length} products needing variants`)
    
    if (productsNeedingVariants.length === 0) {
      logger.info("✅ All products already have variants!")
      return
    }
    
    // Create variants for products that need them
    for (const product of productsNeedingVariants) {
      await createVariantsForProduct(container, product, defaultSalesChannel[0])
    }
    
    logger.info("✅ Product variants fix completed!")
    
  } catch (error) {
    logger.error("❌ Error fixing product variants:", error)
    throw error
  }
}

async function createVariantsForProduct(container: any, product: any, salesChannel: any) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)
  
  logger.info(`Creating variants for: ${product.title}`)
  
  // Define variants based on product type
  const variantsData = getVariantsForProduct(product.title)
  
  if (!variantsData) {
    logger.warn(`No variant template found for: ${product.title}`)
    return
  }
  
  try {
    // First, create product options if they don't exist
    if (!product.options || product.options.length === 0) {
      await productModuleService.updateProducts(product.id, {
        options: variantsData.options
      })
      logger.info(`✅ Created options for ${product.title}`)
    }
    
    // Then create variants
    for (const variantData of variantsData.variants) {
      try {
        await productModuleService.createProductVariants({
          product_id: product.id,
          title: variantData.title,
          sku: variantData.sku,
          prices: variantData.prices,
          options: variantData.options
        })
        logger.info(`✅ Created variant: ${variantData.title}`)
      } catch (error) {
        if (error.message.includes("already exists")) {
          logger.info(`ℹ️  Variant already exists: ${variantData.title}`)
        } else {
          logger.warn(`⚠️  Could not create variant ${variantData.title}: ${error.message}`)
        }
      }
    }
    
  } catch (error) {
    logger.error(`❌ Error creating variants for ${product.title}:`, error.message)
  }
}

function getVariantsForProduct(productTitle: string) {
  const title = productTitle.toLowerCase()
  
  // Pet Food Products
  if (title.includes("royal canin") || title.includes("dog food")) {
    return {
      options: [
        { title: "Size", values: ["2kg", "7.5kg", "15kg"] },
        { title: "Flavor", values: ["Chicken", "Beef", "Lamb"] }
      ],
      variants: [
        {
          title: "Royal Canin Adult Dog Food - 2kg Chicken",
          sku: "RC-ADULT-2KG-CHICKEN",
          prices: [{ currency_code: "idr", amount: 150000 * 100 }],
          options: { Size: "2kg", Flavor: "Chicken" }
        },
        {
          title: "Royal Canin Adult Dog Food - 7.5kg Chicken",
          sku: "RC-ADULT-7.5KG-CHICKEN",
          prices: [{ currency_code: "idr", amount: 450000 * 100 }],
          options: { Size: "7.5kg", Flavor: "Chicken" }
        },
        {
          title: "Royal Canin Adult Dog Food - 15kg Chicken",
          sku: "RC-ADULT-15KG-CHICKEN",
          prices: [{ currency_code: "idr", amount: 850000 * 100 }],
          options: { Size: "15kg", Flavor: "Chicken" }
        }
      ]
    }
  }
  
  if (title.includes("purina") || title.includes("puppy")) {
    return {
      options: [
        { title: "Size", values: ["1kg", "3kg", "10kg"] },
        { title: "Type", values: ["Dry Food", "Wet Food"] }
      ],
      variants: [
        {
          title: "Purina Puppy Food - 1kg Dry Food",
          sku: "PUR-PUPPY-1KG-DRY",
          prices: [{ currency_code: "idr", amount: 80000 * 100 }],
          options: { Size: "1kg", Type: "Dry Food" }
        },
        {
          title: "Purina Puppy Food - 3kg Dry Food",
          sku: "PUR-PUPPY-3KG-DRY",
          prices: [{ currency_code: "idr", amount: 200000 * 100 }],
          options: { Size: "3kg", Type: "Dry Food" }
        },
        {
          title: "Purina Puppy Food - 10kg Dry Food",
          sku: "PUR-PUPPY-10KG-DRY",
          prices: [{ currency_code: "idr", amount: 600000 * 100 }],
          options: { Size: "10kg", Type: "Dry Food" }
        }
      ]
    }
  }
  
  if (title.includes("whiskas") || title.includes("cat food")) {
    return {
      options: [
        { title: "Size", values: ["1kg", "3kg", "8kg"] },
        { title: "Flavor", values: ["Tuna", "Salmon", "Chicken"] }
      ],
      variants: [
        {
          title: "Whiskas Adult Cat Food - 1kg Tuna",
          sku: "WHI-ADULT-1KG-TUNA",
          prices: [{ currency_code: "idr", amount: 75000 * 100 }],
          options: { Size: "1kg", Flavor: "Tuna" }
        },
        {
          title: "Whiskas Adult Cat Food - 3kg Tuna",
          sku: "WHI-ADULT-3KG-TUNA",
          prices: [{ currency_code: "idr", amount: 200000 * 100 }],
          options: { Size: "3kg", Flavor: "Tuna" }
        },
        {
          title: "Whiskas Adult Cat Food - 8kg Tuna",
          sku: "WHI-ADULT-8KG-TUNA",
          prices: [{ currency_code: "idr", amount: 450000 * 100 }],
          options: { Size: "8kg", Flavor: "Tuna" }
        }
      ]
    }
  }
  
  // Pet Accessories
  if (title.includes("collar") || title.includes("dog")) {
    return {
      options: [
        { title: "Size", values: ["Small", "Medium", "Large"] },
        { title: "Color", values: ["Black", "Brown", "Red", "Blue"] }
      ],
      variants: [
        {
          title: "Premium Dog Collar - Small Black",
          sku: "COL-DOG-SM-BLACK",
          prices: [{ currency_code: "idr", amount: 85000 * 100 }],
          options: { Size: "Small", Color: "Black" }
        },
        {
          title: "Premium Dog Collar - Medium Black",
          sku: "COL-DOG-MD-BLACK",
          prices: [{ currency_code: "idr", amount: 95000 * 100 }],
          options: { Size: "Medium", Color: "Black" }
        },
        {
          title: "Premium Dog Collar - Large Black",
          sku: "COL-DOG-LG-BLACK",
          prices: [{ currency_code: "idr", amount: 105000 * 100 }],
          options: { Size: "Large", Color: "Black" }
        }
      ]
    }
  }
  
  // Pet Health Products
  if (title.includes("vitamin") || title.includes("supplement")) {
    return {
      options: [
        { title: "Size", values: ["30 tablets", "60 tablets", "120 tablets"] },
        { title: "Type", values: ["For Dogs", "For Cats", "Universal"] }
      ],
      variants: [
        {
          title: "Pet Vitamin Supplement - 30 tablets For Dogs",
          sku: "VIT-DOG-30TAB",
          prices: [{ currency_code: "idr", amount: 150000 * 100 }],
          options: { Size: "30 tablets", Type: "For Dogs" }
        },
        {
          title: "Pet Vitamin Supplement - 60 tablets For Dogs",
          sku: "VIT-DOG-60TAB",
          prices: [{ currency_code: "idr", amount: 250000 * 100 }],
          options: { Size: "60 tablets", Type: "For Dogs" }
        },
        {
          title: "Pet Vitamin Supplement - 30 tablets For Cats",
          sku: "VIT-CAT-30TAB",
          prices: [{ currency_code: "idr", amount: 140000 * 100 }],
          options: { Size: "30 tablets", Type: "For Cats" }
        }
      ]
    }
  }
  
  // Default variants for other products
  return {
    options: [
      { title: "Size", values: ["Small", "Medium", "Large"] }
    ],
    variants: [
      {
        title: `${productTitle} - Small`,
        sku: `${productTitle.replace(/\s+/g, '-').toUpperCase()}-SM`,
        prices: [{ currency_code: "idr", amount: 50000 * 100 }],
        options: { Size: "Small" }
      },
      {
        title: `${productTitle} - Medium`,
        sku: `${productTitle.replace(/\s+/g, '-').toUpperCase()}-MD`,
        prices: [{ currency_code: "idr", amount: 75000 * 100 }],
        options: { Size: "Medium" }
      },
      {
        title: `${productTitle} - Large`,
        sku: `${productTitle.replace(/\s+/g, '-').toUpperCase()}-LG`,
        prices: [{ currency_code: "idr", amount: 100000 * 100 }],
        options: { Size: "Large" }
      }
    ]
  }
} 