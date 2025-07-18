import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Badge,
  Table,
  Select,
} from "@medusajs/ui"
import { Plus, ShoppingBag } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

type RestockOrder = {
  id: string
  supplier_id: string
  supplier: {
    company_name: string
  }
  status: "pending" | "confirmed" | "shipped" | "received" | "cancelled"
  total_items: number
  created_at: string
  expected_delivery: string
}

const RestockOrdersWidget = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch restock orders
  const { data: restockOrders, isLoading } = useQuery({
    queryKey: ["restock-orders", statusFilter],
    queryFn: async () => {
      const response = await fetch(`/admin/restock-orders${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`)
      return response.json()
    },
  })

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/admin/restock-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-orders"] })
    },
  })

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-blue-100 text-blue-800",
      received: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const orders = restockOrders?.restock_orders || []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-ui-fg-subtle" />
          <Heading level="h2">Restock Orders</Heading>
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <Select.Trigger className="w-40">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Status</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="confirmed">Confirmed</Select.Item>
              <Select.Item value="shipped">Shipped</Select.Item>
              <Select.Item value="received">Received</Select.Item>
              <Select.Item value="cancelled">Cancelled</Select.Item>
            </Select.Content>
          </Select>
          <Button variant="secondary" size="small">
            <Plus className="mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Text>Loading restock orders...</Text>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="mx-auto mb-4 text-ui-fg-subtle" />
            <Text size="small" className="text-ui-fg-subtle">No restock orders found</Text>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order ID</Table.HeaderCell>
                  <Table.HeaderCell>Supplier</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Items</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Expected Delivery</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {orders.map((order: RestockOrder) => (
                  <Table.Row key={order.id}>
                    <Table.Cell>
                      <Text size="small" weight="plus">#{order.id.slice(-8)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{order.supplier.company_name}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      {getStatusBadge(order.status)}
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{order.total_items}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {new Date(order.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {order.expected_delivery ? 
                          new Date(order.expected_delivery).toLocaleDateString() : 
                          "Not set"
                        }
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-1">
                        <Button 
                          variant="transparent" 
                          size="small"
                          onClick={() => window.open(`/a/restock-orders/${order.id}`, '_blank')}
                        >
                          View
                        </Button>
                        {order.status === "pending" && (
                          <Button 
                            variant="secondary" 
                            size="small"
                            onClick={() => updateStatusMutation.mutate({ 
                              orderId: order.id, 
                              status: "confirmed" 
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Confirm
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button 
                            variant="secondary" 
                            size="small"
                            onClick={() => updateStatusMutation.mutate({ 
                              orderId: order.id, 
                              status: "shipped" 
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Ship
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button 
                            variant="secondary" 
                            size="small"
                            onClick={() => updateStatusMutation.mutate({ 
                              orderId: order.id, 
                              status: "received" 
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Receive
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.after",
})

export default RestockOrdersWidget 