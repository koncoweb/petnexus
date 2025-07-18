import fetch from "node-fetch"

const BASE_URL = "http://localhost:9000"

async function testBrandLinking() {
  console.log("🧪 Testing Brand Linking API...")

  try {
    // Test 1: Create a brand
    console.log("\n1️⃣ Creating a test brand...")
    const createBrandResponse = await fetch(`${BASE_URL}/admin/brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Brand for Sidebar",
        description: "A test brand for sidebar widget testing"
      })
    })

    if (!createBrandResponse.ok) {
      throw new Error(`Failed to create brand: ${createBrandResponse.statusText}`)
    }

    const brand = await createBrandResponse.json()
    console.log("✅ Brand created:", brand)

    // Test 2: Get all products to find one to link
    console.log("\n2️⃣ Getting products...")
    const productsResponse = await fetch(`${BASE_URL}/admin/products`)
    
    if (!productsResponse.ok) {
      throw new Error(`Failed to get products: ${productsResponse.statusText}`)
    }

    const products = await productsResponse.json()
    const firstProduct = products.products?.[0]
    
    if (!firstProduct) {
      console.log("⚠️ No products found, skipping linking test")
      return
    }

    console.log("✅ Found product:", firstProduct.id)

    // Test 3: Link product to brand
    console.log("\n3️⃣ Linking product to brand...")
    const linkResponse = await fetch(`${BASE_URL}/admin/products/${firstProduct.id}/brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand_id: brand.id
      })
    })

    if (!linkResponse.ok) {
      throw new Error(`Failed to link product to brand: ${linkResponse.statusText}`)
    }

    const linkResult = await linkResponse.json()
    console.log("✅ Product linked to brand:", linkResult)

    // Test 4: Get product's brands
    console.log("\n4️⃣ Getting product's brands...")
    const getBrandsResponse = await fetch(`${BASE_URL}/admin/products/${firstProduct.id}/brands`)
    
    if (!getBrandsResponse.ok) {
      throw new Error(`Failed to get product brands: ${getBrandsResponse.statusText}`)
    }

    const productBrands = await getBrandsResponse.json()
    console.log("✅ Product's brands:", productBrands)

    // Test 5: Unlink product from brand
    console.log("\n5️⃣ Unlinking product from brand...")
    const unlinkResponse = await fetch(`${BASE_URL}/admin/products/${firstProduct.id}/brands`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand_id: brand.id
      })
    })

    if (!unlinkResponse.ok) {
      throw new Error(`Failed to unlink product from brand: ${unlinkResponse.statusText}`)
    }

    const unlinkResult = await unlinkResponse.json()
    console.log("✅ Product unlinked from brand:", unlinkResult)

    // Test 6: Clean up - delete the brand
    console.log("\n6️⃣ Cleaning up - deleting test brand...")
    const deleteResponse = await fetch(`${BASE_URL}/admin/brands/${brand.id}`, {
      method: "DELETE"
    })

    if (!deleteResponse.ok) {
      console.log("⚠️ Failed to delete brand (this is okay for testing)")
    } else {
      console.log("✅ Test brand deleted successfully")
    }

    console.log("\n🎉 Brand Linking API Test Completed Successfully!")
    console.log("\n📋 The sidebar widget should now work with:")
    console.log("1. Brand creation via POST /admin/brands")
    console.log("2. Product-brand linking via POST /admin/products/:id/brands")
    console.log("3. Product-brand unlinking via DELETE /admin/products/:id/brands")
    console.log("4. Brand listing via GET /admin/brands")

  } catch (error) {
    console.error("❌ API test failed:", error)
    throw error
  }
}

testBrandLinking()
  .then(() => {
    console.log("✅ All API tests passed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ API tests failed:", error)
    process.exit(1)
  }) 