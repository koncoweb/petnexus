import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { 
  clx, 
  Container, 
  Heading, 
  Text, 
  Select,
  Button,
  Badge
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { useState, useEffect } from "react"

type AdminProductBrand = AdminProduct & {
  brand?: {
    id: string
    name: string
  }
}

type Brand = {
  id: string
  name: string
  description?: string
}

type BrandsResponse = {
  brands: Brand[]
  count: number
}

const ProductBrandSidebarWidget = ({ 
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const [selectedBrandId, setSelectedBrandId] = useState<string>("none")

  // Fetch product with brand information
  const { data: queryResult, isLoading: productLoading } = useQuery({
    queryFn: () => sdk.admin.product.retrieve(product.id, {
      fields: "+brand.*",
    }),
    queryKey: [["product", product.id]],
  })

  // Fetch all available brands using SDK
  const { data: brandsData, isLoading: brandsLoading, error: brandsError } = useQuery({
    queryFn: async (): Promise<BrandsResponse> => {
      try {
        const response = await sdk.client.fetch("/admin/brands")
        console.log("Brands API response:", response)
        
        // API now returns proper format: { brands: Brand[], count: number }
        return response as BrandsResponse
      } catch (error) {
        console.error("Brands API error:", error)
        throw error
      }
    },
    queryKey: ["brands"],
    retry: 1, // Only retry once
    retryDelay: 1000,
  })

  // Safely extract brands array
  const brands = brandsData?.brands || []

  const currentBrand = (queryResult?.product as AdminProductBrand)?.brand

  // Set initial selected brand
  useEffect(() => {
    if (currentBrand) {
      setSelectedBrandId(currentBrand.id)
    } else {
      setSelectedBrandId("none")
    }
  }, [currentBrand])

  // Mutation to update product brand
  const updateBrandMutation = useMutation({
    mutationFn: async (brandId: string | null) => {
      if (brandId && brandId !== "none") {
        // Link product to brand
        await sdk.client.fetch(`/admin/products/${product.id}/brands`, {
          method: "POST",
          body: JSON.stringify({ brand_id: brandId })
        })
      } else {
        // Unlink product from brand
        await sdk.client.fetch(`/admin/products/${product.id}/brands`, {
          method: "DELETE",
          body: JSON.stringify({ brand_id: currentBrand?.id })
        })
      }
    },
    onSuccess: () => {
      // Refetch product data
      queryClient.invalidateQueries({ queryKey: [["product", product.id]] })
    },
  })

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId)
    const newBrandId = brandId === "none" ? null : brandId
    updateBrandMutation.mutate(newBrandId)
  }

  const isLoading = productLoading || brandsLoading || updateBrandMutation.isPending

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h3">Brand</Heading>
        </div>
        {currentBrand && (
          <Badge className="text-xs bg-gray-100 text-gray-700">
            Assigned
          </Badge>
        )}
      </div>
      
      <div className="px-6 py-4 space-y-4">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : brandsError ? (
          <div className="text-sm text-red-500">
            Error loading brands: {brandsError.message}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Text size="small" weight="plus" className="text-gray-700">
                Select Brand
              </Text>
              <Select
                value={selectedBrandId}
                onValueChange={handleBrandChange}
                disabled={isLoading}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Choose a brand..." />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="none">No Brand</Select.Item>
                  {brands.map((brand: Brand) => (
                    <Select.Item key={brand.id} value={brand.id}>
                      {brand.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            {currentBrand && (
              <div className="space-y-2">
                <Text size="small" weight="plus" className="text-gray-700">
                  Current Brand
                </Text>
                <div className="p-3 bg-gray-50 rounded-md">
                  <Text size="small" className="font-medium text-gray-900">
                    {currentBrand.name}
                  </Text>
                </div>
              </div>
            )}

            {brands.length === 0 && !brandsError && (
              <div className="text-sm text-gray-500 text-center py-2">
                No brands available. Create a brand first.
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductBrandSidebarWidget 