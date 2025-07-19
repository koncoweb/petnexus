import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function setupStep1Variants({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Step 1: Setting up Product Variants for Petshop...")
  
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
    
    // Map existing products to pet products
    const productMapping = {
      "Royal Canin Adult Dog Food": existingProducts.find(p => p.title.includes("Royal Canin") || p.title.includes("Dog Food")),
      "Purina Puppy Food": existingProducts.find(p => p.title.includes("Purina") || p.title.includes("Puppy")),
      "Whiskas Adult Cat Food": existingProducts.find(p => p.title.includes("Whiskas") || p.title.includes("Cat Food")),
      "Premium Dog Collar": existingProducts.find(p => p.title.includes("Collar") || p.title.includes("Dog")),
      "Pet Vitamin Supplement": existingProducts.find(p => p.title.includes("Vitamin") || p.title.includes("Supplement"))
    }
    
    // Define pet product data with variants
    const petProductsData = [
      {
        title: "Royal Canin Adult Dog Food",
        description: "Complete nutrition for adult dogs 12+ months",
        status: ProductStatus.PUBLISHED,
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
        ],
        sales_channels: [{ id: defaultSalesChannel[0].id }]
      },
      {
        title: "Purina Puppy Food",
        description: "Nutritious food for puppies 2-12 months",
        status: ProductStatus.PUBLISHED,
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
        ],
        sales_channels: [{ id: defaultSalesChannel[0].id }]
      },
      {
        title: "Whiskas Adult Cat Food",
        description: "Complete nutrition for adult cats",
        status: ProductStatus.PUBLISHED,
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
        ],
        sales_channels: [{ id: defaultSalesChannel[0].id }]
      },
      {
        title: "Premium Dog Collar",
        description: "Comfortable and durable dog collar",
        status: ProductStatus.PUBLISHED,
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
        ],
        sales_channels: [{ id: defaultSalesChannel[0].id }]
      },
      {
        title: "Pet Vitamin Supplement",
        description: "Essential vitamins for dogs and cats",
        status: ProductStatus.PUBLISHED,
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
        ],
        sales_channels: [{ id: defaultSalesChannel[0].id }]
      }
    ]
    
    let createdProducts: any[] = []
    let updatedProducts: any[] = []
    
    // Process each pet product
    for (const petProduct of petProductsData) {
      const existingProduct = productMapping[petProduct.title]
      
      if (existingProduct) {
        // Update existing product with variants
        logger.info(`Updating existing product: ${existingProduct.title}`)
        
        try {
          const updatedProduct = await productModuleService.updateProducts(existingProduct.id, {
            title: petProduct.title,
            description: petProduct.description,
            status: petProduct.status,
            options: petProduct.options
          })
          
          // Add variants to the updated product
          for (const variantData of petProduct.variants) {
            await productModuleService.createProductVariants({
              product_id: updatedProduct.id,
              ...variantData
            })
          }
          
          updatedProducts.push(updatedProduct)
          logger.info(`✅ Updated product: ${updatedProduct.title}`)
        } catch (error) {
          logger.warn(`⚠️  Could not update product ${existingProduct.title}: ${error.message}`)
        }
      } else {
        // Create new product
        logger.info(`Creating new product: ${petProduct.title}`)
        try {
          const { result: newProducts } = await createProductsWorkflow(container).run({
            input: { products: [petProduct] }
          })
          createdProducts.push(...newProducts)
          logger.info(`✅ Created product: ${petProduct.title}`)
        } catch (error) {
          logger.warn(`⚠️  Could not create product ${petProduct.title}: ${error.message}`)
        }
      }
    }
    
    const allProducts: any[] = [...createdProducts, ...updatedProducts]
    
    logger.info(`✅ Step 1 Completed: ${createdProducts.length} products created, ${updatedProducts.length} products updated`)
    
    console.log("\n📦 PRODUCTS PROCESSED:")
    allProducts.forEach(product => {
      console.log(`  ✅ ${product.title}`)
      if (product.variants && product.variants.length > 0) {
        console.log(`     - ${product.variants.length} variants`)
        console.log(`     - SKUs: ${product.variants.map(v => v.sku).join(", ")}`)
      } else {
        console.log(`     - No variants (will be added in next step)`)
      }
    })
    
    console.log("\n🔗 NEXT STEPS:")
    console.log("1. Run: npm run setup-step2-inventory")
    console.log("2. Run: npm run setup-step3-suppliers")
    console.log("3. Run: npm run setup-step4-restock-orders")
    
    return allProducts
    
  } catch (error) {
    logger.error("❌ Error in Step 1 - Product Variants Setup:", error)
    throw error
  }
} 