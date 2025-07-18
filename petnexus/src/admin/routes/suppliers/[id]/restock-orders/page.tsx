import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings, ArrowLeft, Plus, ShoppingBag } from "@medusajs/icons"
import { Container, Heading, Button, Badge, Text, Select, Table } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { sdk } from "../../../../lib/sdk"

type RestockOrder = {
  id: string
  supplier_id: string
  status: string
  total_items: number
  total_cost: number
  notes: string
  created_at: string
  updated_at: string
}

const RestockOrdersPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch supplier details
  const { data: supplier } = useQuery<{ supplier: any }>({
    queryKey: ["supplier", id],
    queryFn: async (): Promise<{ supplier: any }> => {
      const response = await sdk.client.fetch(`/admin/suppliers/${id}`)
      return response as { supplier: any }
    },
  })

  // Fetch restock orders
  const { data: restockOrders, isLoading } = useQuery<{ orders: RestockOrder[] }>({
    queryKey: ["supplier-restock-orders", id, statusFilter],
    queryFn: async (): Promise<{ orders: RestockOrder[] }> => {
      const response = await sdk.client.fetch(`/admin/suppliers/${id}/restock-orders${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`)
      return response as { orders: RestockOrder[] }
    },
  })

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await sdk.client.fetch(`/admin/restock-orders/${orderId}`, {
        method: "PATCH",
        body: { status },
      })
      return response
    },
    onSuccess: () => {
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

  const ordersList = restockOrders?.orders || []

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="transparent" 
            size="small"
            onClick={() => navigate(`/suppliers/${id}`)}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <Buildings className="text-ui-fg-subtle" />
          <Heading level="h2">
            Restock Orders - {supplier?.supplier?.company_name}
          </Heading>
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <Select.Trigger className="w-32">
              <Select.Value placeholder="All Status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Status</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="confirmed">Confirmed</Select.Item>
              <Select.Item value="shipped">Shipped</Select.Item>
              <Select.Item value="delivered">Delivered</Select.Item>
              <Select.Item value="cancelled">Cancelled</Select.Item>
            </Select.Content>
          </Select>
          <Button
            variant="primary"
            size="small"
            onClick={() => navigate(`/suppliers/${id}/restock-orders/new`)}
          >
            <Plus />
            New Order
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Total Orders</Text>
            <Text size="large" weight="plus">{ordersList.length}</Text>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Pending</Text>
            <Text size="large" weight="plus">
              {ordersList.filter(o => o.status === "pending").length}
            </Text>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">In Progress</Text>
            <Text size="large" weight="plus">
              {ordersList.filter(o => ["confirmed", "shipped"].includes(o.status)).length}
            </Text>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Completed</Text>
            <Text size="large" weight="plus">
              {ordersList.filter(o => o.status === "delivered").length}
            </Text>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Text>Loading restock orders...</Text>
          </div>
        ) : ordersList.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="mx-auto mb-4 text-ui-fg-subtle" />
            <Text size="small" className="text-ui-fg-subtle">No restock orders found</Text>
            <Button 
              variant="secondary" 
              size="small" 
              className="mt-2"
              onClick={() => navigate(`/suppliers/${id}/restock-orders/new`)}
            >
              <Plus className="mr-2" />
              Create First Order
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order ID</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Items</Table.HeaderCell>
                  <Table.HeaderCell>Total Cost</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ordersList.map((order) => (
                  <Table.Row key={order.id}>
                    <Table.Cell>
                      <Text size="small" weight="plus">#{order.id}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      {getStatusBadge(order.status)}
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{order.total_items} items</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        ${order.total_cost?.toFixed(2) || "0.00"}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {new Date(order.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => navigate(`/suppliers/${id}/restock-orders/${order.id}`)}
                        >
                          View
                        </Button>
                        {getStatusOptions(order.status).length > 0 && (
                          <Select
                            onValueChange={(status) => updateStatusMutation.mutate({ orderId: order.id, status })}
                          >
                            <Select.Trigger className="w-24">
                              <Select.Value placeholder="Update" />
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

export const config = defineRouteConfig({
  label: "Restock Orders",
  icon: ShoppingBag,
})

export default RestockOrdersPage 