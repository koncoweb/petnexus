import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings, ArrowLeft, ShoppingBag } from "@medusajs/icons"
import { Container, Heading, Button, Badge, Text, Select, Table } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { sdk } from "../../../../../lib/sdk"

type RestockOrder = {
  id: string
  supplier_id: string
  status: string
  total_items: number
  total_cost: number
  currency_code: string
  notes: string
  expected_delivery_date: string
  actual_delivery_date: string
  created_at: string
  updated_at: string
  items: Array<{
    id: string
    product_id: string
    variant_id: string
    quantity: number
    unit_cost: number
    total_cost: number
    notes: string
  }>
}

const RestockOrderDetailPage = () => {
  const navigate = useNavigate()
  const { id, orderId } = useParams<{ id: string; orderId: string }>()
  const queryClient = useQueryClient()

  // Fetch restock order details
  const { data: orderData, isLoading } = useQuery<{ order: RestockOrder }>({
    queryKey: ["restock-order", orderId],
    queryFn: async (): Promise<{ order: RestockOrder }> => {
      const response = await sdk.client.fetch(`/admin/restock-orders/${orderId}`)
      return response as { order: RestockOrder }
    },
  })

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const response = await sdk.client.fetch(`/admin/restock-orders/${orderId}`, {
        method: "PATCH",
        body: { status },
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-order", orderId] })
      queryClient.invalidateQueries({ queryKey: ["supplier-restock-orders", id] })
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

  const order = orderData?.order

  if (isLoading) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Text>Loading restock order...</Text>
        </div>
      </Container>
    )
  }

  if (!order) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Text>Restock order not found</Text>
        </div>
      </Container>
    )
  }

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
            Back to Orders
          </Button>
          <ShoppingBag className="text-ui-fg-subtle" />
          <Heading level="h2">
            Restock Order #{order.id}
          </Heading>
        </div>
        <div className="flex gap-2">
          {getStatusOptions(order.status).length > 0 && (
            <Select
              onValueChange={(status) => updateStatusMutation.mutate({ status })}
            >
              <Select.Trigger className="w-32">
                <Select.Value placeholder="Update Status" />
              </Select.Trigger>
              <Select.Content>
                {getStatusOptions(order.status).map((status) => (
                  <Select.Item key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Status</Text>
            <div className="mt-2">
              {getStatusBadge(order.status)}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Total Items</Text>
            <Text size="large" weight="plus">{order.total_items}</Text>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Total Cost</Text>
            <Text size="large" weight="plus">
              {order.currency_code} {order.total_cost?.toFixed(2) || "0.00"}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Text size="small" weight="plus" className="mb-2 block">Expected Delivery</Text>
            <Text size="small">
              {order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : "Not set"}
            </Text>
          </div>
          <div>
            <Text size="small" weight="plus" className="mb-2 block">Actual Delivery</Text>
            <Text size="small">
              {order.actual_delivery_date ? new Date(order.actual_delivery_date).toLocaleDateString() : "Not delivered"}
            </Text>
          </div>
        </div>

        {order.notes && (
          <div className="mb-6">
            <Text size="small" weight="plus" className="mb-2 block">Notes</Text>
            <Text size="small" className="text-ui-fg-subtle">{order.notes}</Text>
          </div>
        )}

        <div className="mb-4">
          <Text size="small" weight="plus" className="mb-2 block">Order Items</Text>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product ID</Table.HeaderCell>
                <Table.HeaderCell>Variant ID</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Unit Cost</Table.HeaderCell>
                <Table.HeaderCell>Total Cost</Table.HeaderCell>
                <Table.HeaderCell>Notes</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {order.items?.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <Text size="small">{item.product_id}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{item.variant_id}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{item.quantity}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">
                      {order.currency_code} {item.unit_cost?.toFixed(2) || "0.00"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">
                      {order.currency_code} {item.total_cost?.toFixed(2) || "0.00"}
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

        {(!order.items || order.items.length === 0) && (
          <div className="text-center py-8">
            <Text size="small" className="text-ui-fg-subtle">No items in this order</Text>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Restock Order Details",
  icon: ShoppingBag,
})

export default RestockOrderDetailPage 