import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings, ArrowLeft, Check } from "@medusajs/icons"
import { Container, Heading, Button, Text, Input, Textarea, Select } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { sdk } from "../../../../../lib/sdk"

type Product = {
  id: string
  title: string
  variants: Array<{
    id: string
    title: string
    inventory_quantity: number
  }>
}

const NewRestockOrderPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    total_items: 0,
    total_cost: 0,
    currency_code: "USD",
    notes: "",
    expected_delivery_date: "",
  })
  
  const [items, setItems] = useState<Array<{
    product_id: string
    variant_id: string
    quantity: number
    unit_cost: number
    notes: string
  }>>([])

  // Fetch supplier details
  const { data: supplier } = useQuery<{ supplier: any }>({
    queryKey: ["supplier", id],
    queryFn: async (): Promise<{ supplier: any }> => {
      const response = await sdk.client.fetch(`/admin/suppliers/${id}`)
      return response as { supplier: any }
    },
  })

  // Fetch products for selection
  const { data: products } = useQuery<{ products: Product[] }>({
    queryKey: ["products"],
    queryFn: async (): Promise<{ products: Product[] }> => {
      const response = await sdk.client.fetch("/admin/products")
      return response as { products: Product[] }
    },
  })

  // Create restock order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await sdk.client.fetch(`/admin/suppliers/${id}/restock-orders`, {
        method: "POST",
        body: data,
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-restock-orders", id] })
      navigate(`/suppliers/${id}/restock-orders`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const orderData = {
      ...formData,
      items,
    }
    
    createOrderMutation.mutate(orderData)
  }

  const addItem = () => {
    setItems([...items, {
      product_id: "",
      variant_id: "",
      quantity: 1,
      unit_cost: 0,
      notes: "",
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const selectedProduct = products?.products?.find(p => p.id === items[0]?.product_id)

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="transparent" 
            size="small"
            onClick={() => navigate(`/suppliers/${id}/restock-orders`)}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <Buildings className="text-ui-fg-subtle" />
          <Heading level="h2">
            New Restock Order - {supplier?.supplier?.company_name}
          </Heading>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Text size="small" weight="plus" className="mb-2 block">Total Items</Text>
            <Input
              type="number"
              value={formData.total_items}
              onChange={(e) => setFormData({ ...formData, total_items: parseInt(e.target.value) || 0 })}
              min="1"
              required
            />
          </div>
          
          <div>
            <Text size="small" weight="plus" className="mb-2 block">Total Cost</Text>
            <Input
              type="number"
              step="0.01"
              value={formData.total_cost}
              onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })}
              min="0"
              required
            />
          </div>
          
          <div>
            <Text size="small" weight="plus" className="mb-2 block">Currency</Text>
            <Select
              value={formData.currency_code}
              onValueChange={(value) => setFormData({ ...formData, currency_code: value })}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="USD">USD</Select.Item>
                <Select.Item value="EUR">EUR</Select.Item>
                <Select.Item value="GBP">GBP</Select.Item>
              </Select.Content>
            </Select>
          </div>
          
          <div>
            <Text size="small" weight="plus" className="mb-2 block">Expected Delivery Date</Text>
            <Input
              type="date"
              value={formData.expected_delivery_date}
              onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-6">
          <Text size="small" weight="plus" className="mb-2 block">Notes</Text>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any notes about this restock order..."
            rows={3}
          />
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Text size="small" weight="plus">Order Items</Text>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={addItem}
            >
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="border rounded-md p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Text size="small" weight="plus" className="mb-2 block">Product</Text>
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => updateItem(index, "product_id", value)}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select product" />
                    </Select.Trigger>
                    <Select.Content>
                      {products?.products?.map((product) => (
                        <Select.Item key={product.id} value={product.id}>
                          {product.title}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div>
                  <Text size="small" weight="plus" className="mb-2 block">Variant</Text>
                  <Select
                    value={item.variant_id}
                    onValueChange={(value) => updateItem(index, "variant_id", value)}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select variant" />
                    </Select.Trigger>
                    <Select.Content>
                      {selectedProduct?.variants?.map((variant) => (
                        <Select.Item key={variant.id} value={variant.id}>
                          {variant.title}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div>
                  <Text size="small" weight="plus" className="mb-2 block">Quantity</Text>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>

                <div>
                  <Text size="small" weight="plus" className="mb-2 block">Unit Cost</Text>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_cost}
                    onChange={(e) => updateItem(index, "unit_cost", parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Text size="small" weight="plus" className="mb-2 block">Item Notes</Text>
                <Input
                  value={item.notes}
                  onChange={(e) => updateItem(index, "notes", e.target.value)}
                  placeholder="Add notes for this item..."
                />
              </div>

              <Button
                type="button"
                variant="transparent"
                size="small"
                onClick={() => removeItem(index)}
                className="mt-2"
              >
                Remove Item
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={createOrderMutation.isPending}
          >
                         <Check className="mr-2" />
            {createOrderMutation.isPending ? "Creating..." : "Create Order"}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/suppliers/${id}/restock-orders`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "New Restock Order",
  icon: Buildings,
})

export default NewRestockOrderPage 