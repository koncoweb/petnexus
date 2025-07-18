import fetch from "node-fetch"

const BASE_URL = "http://localhost:9000"

async function testBrandAPI() {
  console.log("🧪 Testing Brand API Endpoints...")

  try {
    // Test 1: Create a brand
    console.log("\n1️⃣ Creating a test brand...")
    const createResponse = await fetch(`${BASE_URL}/admin/brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Brand for Widget",
        description: "A test brand to verify widget functionality"
      })
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create brand: ${createResponse.statusText}`)
    }

    const brand = await createResponse.json()
    console.log("✅ Brand created:", brand)

    // Test 2: Retrieve the brand
    console.log("\n2️⃣ Retrieving the brand...")
    const retrieveResponse = await fetch(`${BASE_URL}/admin/brands/${brand.id}`)
    
    if (!retrieveResponse.ok) {
      throw new Error(`Failed to retrieve brand: ${retrieveResponse.statusText}`)
    }

    const retrievedBrand = await retrieveResponse.json()
    console.log("✅ Brand retrieved:", retrievedBrand)

    // Test 3: List all brands
    console.log("\n3️⃣ Listing all brands...")
    const listResponse = await fetch(`${BASE_URL}/admin/brands`)
    
    if (!listResponse.ok) {
      throw new Error(`Failed to list brands: ${listResponse.statusText}`)
    }

    const brands = await listResponse.json()
    console.log("✅ Brands listed:", brands)

    // Test 4: Update the brand
    console.log("\n4️⃣ Updating the brand...")
    const updateResponse = await fetch(`${BASE_URL}/admin/brands/${brand.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Updated Test Brand",
        description: "Updated description for widget testing"
      })
    })

    if (!updateResponse.ok) {
      throw new Error(`Failed to update brand: ${updateResponse.statusText}`)
    }

    const updatedBrand = await updateResponse.json()
    console.log("✅ Brand updated:", updatedBrand)

    // Test 5: Delete the brand
    console.log("\n5️⃣ Deleting the brand...")
    const deleteResponse = await fetch(`${BASE_URL}/admin/brands/${brand.id}`, {
      method: "DELETE"
    })

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete brand: ${deleteResponse.statusText}`)
    }

    console.log("✅ Brand deleted successfully")

    console.log("\n🎉 Brand API Test Completed Successfully!")
    console.log("\n📋 Next Steps:")
    console.log("1. The admin widget should now be available")
    console.log("2. Open the admin dashboard: http://localhost:9000/app")
    console.log("3. Navigate to any product page")
    console.log("4. You should see the 'Brand' widget at the top of the product details")
    console.log("5. The widget will show 'No brand assigned' for products without brands")

  } catch (error) {
    console.error("❌ API test failed:", error)
    throw error
  }
}

testBrandAPI()
  .then(() => {
    console.log("✅ All API tests passed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ API tests failed:", error)
    process.exit(1)
  }) 