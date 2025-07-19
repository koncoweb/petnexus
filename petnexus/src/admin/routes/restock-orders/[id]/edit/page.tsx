import { ShoppingBag, ArrowLeft } from "@medusajs/icons"
import { Container, Heading, Button, Text, Input, Textarea, Select } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { sdk } from "../../../../lib/sdk"
import { useState, useEffect } from "react"

type RestockOrder = {
  id: string
  supplier_id: string
  supplier_name?: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  total_items: number
  total_cost: number
  currency_code: string
  notes?: string
  expected_delivery_date?: string
  actual_delivery_date?: string
  created_at: string
  updated_at: string
}

const EditRestockOrderPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  
  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    expected_delivery_date: "",
  })

  // Fetch restock order details
  const { data: orderData, isLoading, error } = useQuery<{ order: RestockOrder }>({
    queryKey: ["restock-order", id],
    queryFn: async (): Promise<{ order: RestockOrder }> => {
      try {
        const response = await sdk.client.fetch(`/admin/restock-orders/${id}`)
        return response as { order: RestockOrder }
      } catch (error) {
        console.error("Error fetching restock order:", error)
        throw new Error(`Failed to fetch restock order: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
    retry: 1,
  })

  // Update restock order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await sdk.client.fetch(`/admin/restock-orders/${id}`, {
        method: "PATCH",
        body: data,
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-order", id] })
      queryClient.invalidateQueries({ queryKey: ["restock-orders"] })
      navigate(`/restock-orders/${id}`)
    },
  })

  // Initialize form data when order is loaded
  useEffect(() => {
    if (orderData?.order) {
      const order = orderData.order
      setFormData({
        status: order.status,
        notes: order.notes || "",
        expected_delivery_date: order.expected_delivery_date || "",
      })
    }
  }, [orderData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    }
    return statusFlow[currentStatus as keyof typeof statusFlow] || []
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updateData: any = {}
    if (formData.status !== orderData?.order.status) {
      updateData.status = formData.status
    }
    if (formData.notes !== orderData?.order.notes) {
      updateData.notes = formData.notes
    }
    if (formData.expected_delivery_date !== orderData?.order.expected_delivery_date) {
      updateData.expected_delivery_date = formData.expected_delivery_date
    }
    
    if (Object.keys(updateData).length > 0) {
      updateOrderMutation.mutate(updateData)
    } else {
      navigate(`/restock-orders/${id}`)
    }
  }

  if (isLoading) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Text>Loading restock order details...</Text>
        </div>
      </Container>
    )
  }

  if (error || !orderData) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <div className="text-center py-8">
            <ShoppingBag className="mx-auto mb-4 text-ui-fg-subtle" />
            <Text size="small" className="text-ui-fg-subtle">Restock order not found</Text>
            {error && (
              <Text size="small" className="text-ui-fg-subtle mt-2">
                Error: {error.message}
              </Text>
            )}
            <Button 
              variant="secondary" 
              size="small" 
              className="mt-2"
              onClick={() => navigate("/restock-orders")}
            >
              <ArrowLeft className="mr-2" />
              Back to Restock Orders
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  const order = orderData.order
  const availableStatuses = getStatusOptions(order.status)

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="transparent" 
            size="small"
            onClick={() => navigate(`/restock-orders/${id}`)}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <ShoppingBag className="text-ui-fg-subtle" />
          <Heading level="h2">Edit Restock Order</Heading>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Order Information */}
          <div>
            <Heading level="h3" className="mb-4">Order Information</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Order ID</Text>
                <Input
                  value={order.id}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Supplier</Text>
                <Input
                  value={order.supplier_name || `Supplier ${order.supplier_id.slice(0, 8)}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Total Items</Text>
                <Input
                  type="number"
                  value={order.total_items}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Total Cost</Text>
                <Input
                  type="number"
                  value={order.total_cost}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Currency</Text>
                <Input
                  value={order.currency_code}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Current Status</Text>
                <Input
                  value={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div>
            <Heading level="h3" className="mb-4">Update Order</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Status</Text>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value={order.status}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)} (Current)
                    </Select.Item>
                    {availableStatuses.map((status) => (
                      <Select.Item key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                {availableStatuses.length === 0 && (
                  <Text size="small" className="text-ui-fg-subtle mt-1">
                    No status transitions available for current status
                  </Text>
                )}
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Expected Delivery Date</Text>
                <Input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => handleInputChange("expected_delivery_date", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <Text size="small" className="text-ui-fg-subtle mb-2">Notes</Text>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add or update notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Read-only Information */}
          <div>
            <Heading level="h3" className="mb-4">Order History</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Created</Text>
                <Input
                  value={new Date(order.created_at).toLocaleDateString()}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Last Updated</Text>
                <Input
                  value={new Date(order.updated_at).toLocaleDateString()}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {order.actual_delivery_date && (
                <div>
                  <Text size="small" className="text-ui-fg-subtle mb-2">Actual Delivery Date</Text>
                  <Input
                    value={new Date(order.actual_delivery_date).toLocaleDateString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/restock-orders/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={updateOrderMutation.isPending}
            >

              {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  )
}

export default EditRestockOrderPage 