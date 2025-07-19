import { ShoppingBag, ArrowLeft, Plus, Trash } from "@medusajs/icons"
import { Container, Heading, Button, Text, Input, Textarea, Select } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import { useState } from "react"

type Supplier = {
  id: string
  company_name: string
  contact_person: string
  email: string
  status: string
}

type Product = {
  id: string
  title: string
  variants: Array<{
    id: string
    title: string
    inventory_quantity: number
  }>
}

type OrderItem = {
  product_id: string
  variant_id: string
  quantity: number
  unit_cost: number
  notes: string
}

const NewRestockOrderPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    supplier_id: "",
    total_items: 0,
    total_cost: 0,
    currency_code: "USD",
    notes: "",
    expected_delivery_date: "",
  })
  
  const [items, setItems] = useState<OrderItem[]>([])

  // Fetch suppliers
  const { data: suppliers } = useQuery<{ suppliers: Supplier[] }>({
    queryKey: ["suppliers"],
    queryFn: async (): Promise<{ suppliers: Supplier[] }> => {
      const response = await sdk.client.fetch("/admin/suppliers")
      return response as { suppliers: Supplier[] }
    },
  })

  // Fetch products
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
      const response = await sdk.client.fetch("/admin/restock-orders", {
        method: "POST",
        body: data,
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-orders"] })
      navigate("/restock-orders")
    },
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const updateItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
    
    setFormData(prev => ({
      ...prev,
      total_items: totalItems,
      total_cost: totalCost
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.supplier_id) {
      alert("Please select a supplier")
      return
    }

    if (items.length === 0) {
      alert("Please add at least one item")
      return
    }

    const orderData = {
      ...formData,
      items,
    }
    
    createOrderMutation.mutate(orderData)
  }

  const getSelectedProduct = (productId: string) => {
    return products?.products.find(p => p.id === productId)
  }

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="transparent" 
            size="small"
            onClick={() => navigate("/restock-orders")}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <ShoppingBag className="text-ui-fg-subtle" />
          <Heading level="h2">Create New Restock Order</Heading>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <Heading level="h3" className="mb-4">Order Information</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Supplier *</Text>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) => handleInputChange("supplier_id", value)}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select supplier" />
                  </Select.Trigger>
                  <Select.Content>
                    {suppliers?.suppliers.map((supplier) => (
                      <Select.Item key={supplier.id} value={supplier.id}>
                        {supplier.company_name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Currency</Text>
                <Select
                  value={formData.currency_code}
                  onValueChange={(value) => handleInputChange("currency_code", value)}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="USD">USD</Select.Item>
                    <Select.Item value="EUR">EUR</Select.Item>
                    <Select.Item value="GBP">GBP</Select.Item>
                    <Select.Item value="IDR">IDR</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Expected Delivery Date</Text>
                <Input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => handleInputChange("expected_delivery_date", e.target.value)}
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Total Items</Text>
                <Input
                  type="number"
                  value={formData.total_items}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Total Cost</Text>
                <Input
                  type="number"
                  value={formData.total_cost}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="mt-4">
              <Text size="small" className="text-ui-fg-subtle mb-2">Notes</Text>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Heading level="h3">Order Items</Heading>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={addItem}
              >
                <Plus className="mr-2" />
                Add Item
              </Button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Text size="small" weight="plus">Item {index + 1}</Text>
                      <Button
                        type="button"
                        variant="transparent"
                        size="small"
                        onClick={() => removeItem(index)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Text size="small" className="text-ui-fg-subtle mb-2">Product *</Text>
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => {
                            updateItem(index, "product_id", value)
                            updateItem(index, "variant_id", "")
                          }}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select product" />
                          </Select.Trigger>
                          <Select.Content>
                            {products?.products.map((product) => (
                              <Select.Item key={product.id} value={product.id}>
                                {product.title}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </div>

                      <div>
                        <Text size="small" className="text-ui-fg-subtle mb-2">Variant *</Text>
                        <Select
                          value={item.variant_id}
                          onValueChange={(value) => updateItem(index, "variant_id", value)}
                          disabled={!item.product_id}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select variant" />
                          </Select.Trigger>
                          <Select.Content>
                            {getSelectedProduct(item.product_id)?.variants.map((variant) => (
                              <Select.Item key={variant.id} value={variant.id}>
                                {variant.title}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </div>

                      <div>
                        <Text size="small" className="text-ui-fg-subtle mb-2">Quantity *</Text>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            updateItem(index, "quantity", parseInt(e.target.value) || 1)
                            calculateTotals()
                          }}
                        />
                      </div>

                      <div>
                        <Text size="small" className="text-ui-fg-subtle mb-2">Unit Cost *</Text>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) => {
                            updateItem(index, "unit_cost", parseFloat(e.target.value) || 0)
                            calculateTotals()
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Text size="small" className="text-ui-fg-subtle mb-2">Item Notes</Text>
                      <Input
                        value={item.notes}
                        onChange={(e) => updateItem(index, "notes", e.target.value)}
                        placeholder="Add notes for this item..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <ShoppingBag className="mx-auto mb-4 text-ui-fg-subtle" />
                <Text size="small" className="text-ui-fg-subtle">
                  No items added yet. Click "Add Item" to get started.
                </Text>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/restock-orders")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  )
}

export default NewRestockOrderPage 