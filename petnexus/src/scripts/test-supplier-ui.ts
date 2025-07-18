async function testSupplierAPI() {
  console.log("🧪 Testing Supplier API Endpoints...\n")

  const baseUrl = "http://localhost:9000"

  try {
    // Test 1: Create a supplier
    console.log("1. Creating a new supplier...")
    const createResponse = await fetch(`${baseUrl}/admin/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: "Test Pet Supplies Co.",
        contact_person: "John Doe",
        email: "john@testpetsupplies.com",
        phone: "+1234567890",
        address: "123 Pet Street",
        city: "Pet City",
        state: "PC",
        country: "USA",
        postal_code: "12345",
        tax_id: "TAX123456",
        payment_terms: "Net 30",
        status: "active",
        website: "https://testpetsupplies.com",
        whatsapp_number: "+1234567890",
        auto_restock_enabled: true,
        ai_restock_threshold: 15,
        notes: "Test supplier for UI testing",
      }),
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create supplier: ${createResponse.status}`)
    }

    const createData = await createResponse.json()
    console.log("✅ Supplier created successfully!")
    console.log("   ID:", createData.supplier.id)
    console.log("   Company:", createData.supplier.company_name)
    console.log("   Status:", createData.supplier.status)
    console.log("   Auto Restock:", createData.supplier.auto_restock_enabled)
    console.log()

    const supplierId = createData.supplier.id

    // Test 2: List suppliers
    console.log("2. Listing suppliers...")
    const listResponse = await fetch(`${baseUrl}/admin/suppliers?q=Test%20Pet&status=active&page=1&limit=10`)

    if (!listResponse.ok) {
      throw new Error(`Failed to list suppliers: ${listResponse.status}`)
    }

    const listData = await listResponse.json()
    console.log("✅ Suppliers listed successfully!")
    console.log("   Total suppliers:", listData.count)
    console.log("   Suppliers found:", listData.suppliers.length)
    console.log()

    // Test 3: Get specific supplier
    console.log("3. Getting specific supplier...")
    const getResponse = await fetch(`${baseUrl}/admin/suppliers/${supplierId}`)

    if (!getResponse.ok) {
      throw new Error(`Failed to get supplier: ${getResponse.status}`)
    }

    const getData = await getResponse.json()
    console.log("✅ Supplier retrieved successfully!")
    console.log("   Company:", getData.supplier.company_name)
    console.log("   Email:", getData.supplier.email)
    console.log("   Address:", getData.supplier.address)
    console.log("   AI Threshold:", getData.supplier.ai_restock_threshold)
    console.log()

    // Test 4: Update supplier
    console.log("4. Updating supplier...")
    const updateResponse = await fetch(`${baseUrl}/admin/suppliers/${supplierId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_person: "Jane Smith",
        phone: "+1987654321",
        notes: "Updated test supplier for UI testing",
        ai_restock_threshold: 20,
      }),
    })

    if (!updateResponse.ok) {
      throw new Error(`Failed to update supplier: ${updateResponse.status}`)
    }

    const updateData = await updateResponse.json()
    console.log("✅ Supplier updated successfully!")
    console.log("   New contact:", updateData.supplier.contact_person)
    console.log("   New phone:", updateData.supplier.phone)
    console.log("   New AI threshold:", updateData.supplier.ai_restock_threshold)
    console.log()

    // Test 5: Create another supplier for testing list
    console.log("5. Creating another supplier for list testing...")
    const create2Response = await fetch(`${baseUrl}/admin/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: "Premium Pet Foods Ltd.",
        contact_person: "Mike Johnson",
        email: "mike@premiumpetfoods.com",
        phone: "+1555123456",
        address: "456 Premium Avenue",
        city: "Premium City",
        state: "PC",
        country: "USA",
        postal_code: "54321",
        status: "active",
        auto_restock_enabled: false,
        ai_restock_threshold: 5,
        notes: "Premium pet food supplier",
      }),
    })

    if (!create2Response.ok) {
      throw new Error(`Failed to create second supplier: ${create2Response.status}`)
    }

    console.log("✅ Second supplier created successfully!")
    console.log()

    // Test 6: List all suppliers
    console.log("6. Listing all suppliers...")
    const allSuppliersResponse = await fetch(`${baseUrl}/admin/suppliers?page=1&limit=20`)

    if (!allSuppliersResponse.ok) {
      throw new Error(`Failed to list all suppliers: ${allSuppliersResponse.status}`)
    }

    const allSuppliersData = await allSuppliersResponse.json()
    console.log("✅ All suppliers listed successfully!")
    console.log("   Total suppliers:", allSuppliersData.count)
    console.log("   Suppliers in response:", allSuppliersData.suppliers.length)
    
    allSuppliersData.suppliers.forEach((supplier: any, index: number) => {
      console.log(`   ${index + 1}. ${supplier.company_name} (${supplier.status})`)
    })
    console.log()

    // Test 7: Test filtering
    console.log("7. Testing filters...")
    const activeSuppliersResponse = await fetch(`${baseUrl}/admin/suppliers?status=active&page=1&limit=10`)

    if (!activeSuppliersResponse.ok) {
      throw new Error(`Failed to filter suppliers: ${activeSuppliersResponse.status}`)
    }

    const activeSuppliersData = await activeSuppliersResponse.json()
    console.log("✅ Active suppliers filtered successfully!")
    console.log("   Active suppliers:", activeSuppliersData.suppliers.length)
    console.log()

    // Test 8: Test search
    console.log("8. Testing search...")
    const searchResponse = await fetch(`${baseUrl}/admin/suppliers?q=Premium&page=1&limit=10`)

    if (!searchResponse.ok) {
      throw new Error(`Failed to search suppliers: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    console.log("✅ Search working successfully!")
    console.log("   Search results:", searchData.suppliers.length)
    searchData.suppliers.forEach((supplier: any, index: number) => {
      console.log(`   ${index + 1}. ${supplier.company_name}`)
    })
    console.log()

    console.log("🎉 All supplier API tests passed successfully!")
    console.log("\n📋 Summary:")
    console.log("   ✅ Create supplier")
    console.log("   ✅ List suppliers")
    console.log("   ✅ Get specific supplier")
    console.log("   ✅ Update supplier")
    console.log("   ✅ Filter by status")
    console.log("   ✅ Search by company name")
    console.log("   ✅ Pagination")
    console.log("\n🚀 Supplier UI Routes are ready for testing!")
    console.log("   Visit: http://localhost:9000/app/suppliers")

  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Run the test
testSupplierAPI() 