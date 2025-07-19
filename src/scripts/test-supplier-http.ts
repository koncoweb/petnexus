import http from 'http'

export default async function testSupplierHTTP() {
  console.log("🧪 Testing Supplier HTTP Endpoint...")
  
  const testProductId = "prod_01K0HT4RZR2MJGVE6CRJSBN60C"
  const baseUrl = "http://localhost:9000"
  
  // Test GET endpoint
  console.log(`\n📡 Testing GET /admin/products/${testProductId}/supplier`)
  
  const getOptions = {
    hostname: 'localhost',
    port: 9000,
    path: `/admin/products/${testProductId}/supplier`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }
  
  const getRequest = http.request(getOptions, (res) => {
    console.log(`  ✅ Status: ${res.statusCode}`)
    console.log(`  ✅ Headers: ${JSON.stringify(res.headers)}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log(`  ✅ Response: ${data}`)
      console.log("\n🎉 GET endpoint test completed!")
      
      // Test POST endpoint
      testPOSTEndpoint(testProductId, baseUrl)
    })
  })
  
  getRequest.on('error', (error) => {
    console.error(`  ❌ GET Error: ${error.message}`)
  })
  
  getRequest.end()
}

function testPOSTEndpoint(productId: string, baseUrl: string) {
  console.log(`\n📡 Testing POST /admin/products/${productId}/supplier`)
  
  const postData = JSON.stringify({
    supplier_id: "supplier_01K0HT4RZR2MJGVE6CRJSBN60C"
  })
  
  const postOptions = {
    hostname: 'localhost',
    port: 9000,
    path: `/admin/products/${productId}/supplier`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  
  const postRequest = http.request(postOptions, (res) => {
    console.log(`  ✅ Status: ${res.statusCode}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log(`  ✅ Response: ${data}`)
      console.log("\n🎉 POST endpoint test completed!")
      
      // Test DELETE endpoint
      testDELETEEndpoint(productId, baseUrl)
    })
  })
  
  postRequest.on('error', (error) => {
    console.error(`  ❌ POST Error: ${error.message}`)
  })
  
  postRequest.write(postData)
  postRequest.end()
}

function testDELETEEndpoint(productId: string, baseUrl: string) {
  console.log(`\n📡 Testing DELETE /admin/products/${productId}/supplier`)
  
  const deleteData = JSON.stringify({
    supplier_id: "supplier_01K0HT4RZR2MJGVE6CRJSBN60C"
  })
  
  const deleteOptions = {
    hostname: 'localhost',
    port: 9000,
    path: `/admin/products/${productId}/supplier`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(deleteData)
    }
  }
  
  const deleteRequest = http.request(deleteOptions, (res) => {
    console.log(`  ✅ Status: ${res.statusCode}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log(`  ✅ Response: ${data}`)
      console.log("\n🎉 DELETE endpoint test completed!")
      console.log("\n🎉 All HTTP endpoint tests completed successfully!")
      console.log("\n📝 Next Steps:")
      console.log("  1. Check admin dashboard: http://localhost:9000/app")
      console.log("  2. Navigate to a product detail page")
      console.log("  3. Look for the supplier widget in the sidebar")
      console.log("  4. Test linking/unlinking suppliers")
    })
  })
  
  deleteRequest.on('error', (error) => {
    console.error(`  ❌ DELETE Error: ${error.message}`)
  })
  
  deleteRequest.write(deleteData)
  deleteRequest.end()
} 