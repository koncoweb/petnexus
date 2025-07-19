import { defineRouteConfig } from "@medusajs/admin-sdk"
import { 
  Container, 
  Heading, 
  Button, 
  Text, 
  Badge, 
  Input,
  Textarea,
  Select,
} from "@medusajs/ui"
import { Gift, Plus } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useParams } from "react-router-dom"

const SupplierPromotionsPage = () => {
  const { id: supplierId } = useParams()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    promotion_type: "product",
    discount_type: "percentage",
    discount_value: 0,
    minimum_quantity: 1,
    start_date: "",
    end_date: "",
    max_usage: "",
    terms_conditions: "",
    brand_ids: [] as string[],
    product_ids: [] as string[],
  })

  // Fetch supplier promotions
  const { data: promotions, isLoading } = useQuery({
    queryKey: ["supplier-promotions", supplierId],
    queryFn: async () => {
      const response = await fetch(`/admin/suppliers/${supplierId}/promotions`)
      return response.json()
    },
  })

  // Fetch brands for selection
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await fetch("/admin/brands")
      return response.json()
    },
  })

  // Fetch products for selection
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/admin/products")
      return response.json()
    },
  })

  // Create promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/admin/suppliers/${supplierId}/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-promotions", supplierId] })
      setIsCreateModalOpen(false)
      setFormData({
        name: "",
        description: "",
        promotion_type: "product",
        discount_type: "percentage",
        discount_value: 0,
        minimum_quantity: 1,
        start_date: "",
        end_date: "",
        max_usage: "",
        terms_conditions: "",
        brand_ids: [],
        product_ids: [],
      })
    },
  })

  const handleCreatePromotion = () => {
    createPromotionMutation.mutate(formData)
  }

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case "brand": return <Gift />
      case "product": return <Gift />
      case "category": return <Gift />
      default: return <Gift />
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "expired": return "bg-red-100 text-red-800"
      case "scheduled": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDiscountDisplay = (promotion: any) => {
    switch (promotion.discount_type) {
      case "percentage":
        return `${promotion.discount_value}% off`
      case "fixed_amount":
        return `$${promotion.discount_value} off`
      case "buy_x_get_y":
        return `Buy ${promotion.buy_quantity} Get ${promotion.get_quantity}`
      case "free_shipping":
        return "Free Shipping"
      default:
        return "Discount"
    }
  }

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.discount_value > 0 &&
      formData.start_date !== "" &&
      formData.end_date !== "" &&
      new Date(formData.start_date) < new Date(formData.end_date)
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Supplier Promotions</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Manage promotional offers for this supplier
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="mr-2" />
          Create Promotion
        </Button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <Text>Loading promotions...</Text>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions?.promotions?.map((promotion: any) => (
              <div key={promotion.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPromotionTypeIcon(promotion.promotion_type)}
                    <Heading level="h3">{promotion.name}</Heading>
                  </div>
                  <Badge className={getStatusBadgeColor(promotion.status)}>
                    {promotion.status}
                  </Badge>
                </div>
                
                <Text size="small" className="text-ui-fg-subtle mb-3">
                  {promotion.description}
                </Text>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <Text size="small" weight="plus">Discount</Text>
                    <Text size="small" className="text-green-600 font-medium">
                      {formatDiscountDisplay(promotion)}
                    </Text>
                  </div>
                  
                  <div>
                    <Text size="small" weight="plus">Min Qty</Text>
                    <Text size="small">{promotion.minimum_quantity}</Text>
                  </div>
                  
                  <div>
                    <Text size="small" weight="plus">Usage</Text>
                    <Text size="small">
                      {promotion.current_usage || 0}
                      {promotion.max_usage && ` / ${promotion.max_usage}`}
                    </Text>
                  </div>
                  
                  <div>
                    <Text size="small" weight="plus">Validity</Text>
                    <Text size="small">
                      {new Date(promotion.start_date).toLocaleDateString()} - 
                      {new Date(promotion.end_date).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="secondary" size="small">
                    Edit
                  </Button>
                  <Button variant="danger" size="small">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            {promotions?.promotions?.length === 0 && (
              <div className="text-center py-8">
                <Gift className="mx-auto mb-2 text-ui-fg-subtle" />
                <Text size="small" className="text-ui-fg-subtle">
                  No promotions created yet
                </Text>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Promotion Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Heading level="h3">Create New Promotion</Heading>
              <Button
                variant="transparent"
                size="small"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              {createPromotionMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <Text size="small" className="text-red-600">
                    Failed to create promotion. Please try again.
                  </Text>
                </div>
              )}

              <div>
                <Text size="small" weight="plus" className="mb-2">Promotion Name *</Text>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2">Description *</Text>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the promotion..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text size="small" weight="plus" className="mb-2">Promotion Type</Text>
                  <Select
                    value={formData.promotion_type}
                    onValueChange={(value) => setFormData({ ...formData, promotion_type: value })}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="brand">Brand Level</Select.Item>
                      <Select.Item value="product">Product Level</Select.Item>
                      <Select.Item value="category">Category Level</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                
                <div>
                  <Text size="small" weight="plus" className="mb-2">Discount Type</Text>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="percentage">Percentage</Select.Item>
                      <Select.Item value="fixed_amount">Fixed Amount</Select.Item>
                      <Select.Item value="buy_x_get_y">Buy X Get Y</Select.Item>
                      <Select.Item value="free_shipping">Free Shipping</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text size="small" weight="plus" className="mb-2">Discount Value *</Text>
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    placeholder="10"
                    min="0"
                  />
                </div>
                
                <div>
                  <Text size="small" weight="plus" className="mb-2">Minimum Quantity</Text>
                  <Input
                    type="number"
                    value={formData.minimum_quantity}
                    onChange={(e) => setFormData({ ...formData, minimum_quantity: Number(e.target.value) })}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text size="small" weight="plus" className="mb-2">Start Date *</Text>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Text size="small" weight="plus" className="mb-2">End Date *</Text>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2">Max Usage (Optional)</Text>
                <Input
                  type="number"
                  value={formData.max_usage}
                  onChange={(e) => setFormData({ ...formData, max_usage: e.target.value })}
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
              
              {formData.promotion_type === "brand" && (
                <div>
                  <Text size="small" weight="plus" className="mb-2">Select Brands</Text>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!formData.brand_ids.includes(value)) {
                        setFormData({ 
                          ...formData, 
                          brand_ids: [...formData.brand_ids, value] 
                        })
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select brands..." />
                    </Select.Trigger>
                    <Select.Content>
                      {brands?.brands?.map((brand: any) => (
                        <Select.Item key={brand.id} value={brand.id}>
                          {brand.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formData.brand_ids.map((brandId) => {
                      const brand = brands?.brands?.find((b: any) => b.id === brandId)
                      return (
                        <Badge key={brandId} className="bg-blue-100 text-blue-800">
                          {brand?.name}
                          <button
                            onClick={() => setFormData({
                              ...formData,
                              brand_ids: formData.brand_ids.filter(id => id !== brandId)
                            })}
                            className="ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {formData.promotion_type === "product" && (
                <div>
                  <Text size="small" weight="plus" className="mb-2">Select Products</Text>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!formData.product_ids.includes(value)) {
                        setFormData({ 
                          ...formData, 
                          product_ids: [...formData.product_ids, value] 
                        })
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select products..." />
                    </Select.Trigger>
                    <Select.Content>
                      {products?.products?.map((product: any) => (
                        <Select.Item key={product.id} value={product.id}>
                          {product.title}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formData.product_ids.map((productId) => {
                      const product = products?.products?.find((p: any) => p.id === productId)
                      return (
                        <Badge key={productId} className="bg-green-100 text-green-800">
                          {product?.title}
                          <button
                            onClick={() => setFormData({
                              ...formData,
                              product_ids: formData.product_ids.filter(id => id !== productId)
                            })}
                            className="ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreatePromotion}
                disabled={createPromotionMutation.isPending || !isFormValid()}
              >
                {createPromotionMutation.isPending ? "Creating..." : "Create Promotion"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Promotions",
  icon: Gift,
})

export default SupplierPromotionsPage 