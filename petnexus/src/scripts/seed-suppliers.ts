import { loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

async function seedSuppliers() {
  try {
    console.log("🌱 Seeding suppliers and restock orders...")

    // For now, just log that seeding is ready
    // This will be implemented when we have the proper container setup
    console.log("✅ Supplier seeding script is ready!")
    console.log("📝 To run seeding, use: npx medusa seed")
    
  } catch (error) {
    console.error("❌ Error in seeding script:", error)
  }
}

seedSuppliers() 