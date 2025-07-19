import { ShoppingBag, ArrowLeft, Pencil, Calendar, User } from "@medusajs/icons"
import { Container, Heading, Button, Badge, Text, Divider, Table, Select } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import { useState } from "react"

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
  items?: RestockOrderItem[]
}

type RestockOrderItem = {
  id: string
  restock_order_id: string
  product_id: string
  variant_id: string
  product_title?: string
  variant_title?: string
  quantity: number
  unit_cost: number
  total_cost: number
  notes?: string
  created_at: string
  updated_at: string
}

const RestockOrderDetailPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const [isUpdating, setIsUpdating] = useState(false)

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

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const response = await sdk.client.fetch(`/admin/restock-orders/${id}`, {
        method: "PATCH",
        body: { status },
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-order", id] })
      queryClient.invalidateQueries({ queryKey: ["restock-orders"] })
    },
  })

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateStatusMutation.mutateAsync({ status: newStatus })
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsUpdating(false)
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
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Order ID: {id}
            </Text>
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
            onClick={() => navigate("/restock-orders")}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <ShoppingBag className="text-ui-fg-subtle" />
          <Heading level="h2">Order {order.id.slice(0, 8)}...</Heading>
          {getStatusBadge(order.status)}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => navigate(`/restock-orders/${id}/edit`)}
          >
            <Pencil className="mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Order Details */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <Heading level="h3" className="mb-4">Order Information</Heading>
              <div className="space-y-3">
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Order ID</Text>
                  <Text size="small" weight="plus" className="font-mono">{order.id}</Text>
                </div>
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Status</Text>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    {availableStatuses.length > 0 && (
                      <Select
                        value=""
                        onValueChange={handleStatusUpdate}
                        disabled={isUpdating}
                        size="small"
                      >
                        <Select.Trigger className="w-32">
                          <Select.Value placeholder="Update" />
                        </Select.Trigger>
                        <Select.Content>
                          {availableStatuses.map((status) => (
                            <Select.Item key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    )}
                  </div>
                </div>
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Total Items</Text>
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4 text-ui-fg-subtle" />
                    <Text size="small">{order.total_items}</Text>
                  </div>
                </div>
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Total Cost</Text>
                  <div className="flex items-center gap-1">
                    <Text size="small" weight="plus">
                      {formatCurrency(order.total_cost, order.currency_code)}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Currency</Text>
                  <Text size="small">{order.currency_code}</Text>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <Heading level="h3" className="mb-4">Important Dates</Heading>
              <div className="space-y-3">
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Created</Text>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-ui-fg-subtle" />
                    <Text size="small">{formatDate(order.created_at)}</Text>
                  </div>
                </div>
                {order.expected_delivery_date && (
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Expected Delivery</Text>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-ui-fg-subtle" />
                      <Text size="small">{formatDate(order.expected_delivery_date)}</Text>
                    </div>
                  </div>
                )}
                {order.actual_delivery_date && (
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Actual Delivery</Text>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-ui-fg-subtle" />
                      <Text size="small">{formatDate(order.actual_delivery_date)}</Text>
                    </div>
                  </div>
                )}
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Last Updated</Text>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-ui-fg-subtle" />
                    <Text size="small">{formatDate(order.updated_at)}</Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <Heading level="h3" className="mb-4">Notes</Heading>
                <Text size="small">{order.notes}</Text>
              </div>
            )}
          </div>

          {/* Supplier Information */}
          <div className="space-y-6">
            <div>
              <Heading level="h3" className="mb-4">Supplier Information</Heading>
              <div className="space-y-3">
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Supplier ID</Text>
                  <Text size="small" className="font-mono">{order.supplier_id}</Text>
                </div>
                {order.supplier_name && (
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Supplier Name</Text>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-ui-fg-subtle" />
                      <Text size="small">{order.supplier_name}</Text>
                    </div>
                  </div>
                )}
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => navigate(`/suppliers/${order.supplier_id}`)}
                >
                  View Supplier Details
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <>
            <Divider />
            <div className="mt-6">
              <Heading level="h3" className="mb-4">Order Items</Heading>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Product</Table.HeaderCell>
                      <Table.HeaderCell>Variant</Table.HeaderCell>
                      <Table.HeaderCell>Quantity</Table.HeaderCell>
                      <Table.HeaderCell>Unit Cost</Table.HeaderCell>
                      <Table.HeaderCell>Total Cost</Table.HeaderCell>
                      <Table.HeaderCell>Notes</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {order.items.map((item) => (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          <Text size="small">
                            {item.product_title || `Product ${item.product_id.slice(0, 8)}`}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small">
                            {item.variant_title || `Variant ${item.variant_id.slice(0, 8)}`}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small">{item.quantity}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small">
                            {formatCurrency(item.unit_cost, order.currency_code)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small" weight="plus">
                            {formatCurrency(item.total_cost, order.currency_code)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small" className="text-ui-fg-subtle">
                            {item.notes || "-"}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export default RestockOrderDetailPage 