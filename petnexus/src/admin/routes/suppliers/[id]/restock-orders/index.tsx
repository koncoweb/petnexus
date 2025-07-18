import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Badge,
  Table,
  Select,
  Input,
} from "@medusajs/ui"
import { Buildings, ArrowLeft, Plus, ShoppingBag } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"

type RestockOrder = {
  id: string
  supplier_id: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  currency_code: string
  notes: string
  expected_delivery_date: string
  created_at: string
  updated_at: string
  items: RestockOrderItem[]
}

type RestockOrderItem = {
  id: string
  restock_order_id: string
  product_id: string
  variant_id: string
  quantity: number
  unit_price: number
  product_title: string
  variant_title: string
}

type Supplier = {
  id: string
  company_name: string
  contact_person: string
  email: string
  status: string
}

const RestockOrdersPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  // Fetch supplier details
  const { data: supplier } = useQuery<{ supplier: Supplier }>({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const response = await fetch(`/admin/suppliers/${id}`)
      return response.json()
    },
  })

  // Fetch restock orders
  const { data: restockOrders, isLoading } = useQuery<{ orders: RestockOrder[], count: number }>({
    queryKey: ["restock-orders", id, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      params.append("page", page.toString())
      
      const response = await fetch(`/admin/suppliers/${id}/restock-orders?${params}`)
      return response.json()
    },
  })

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      const response = await fetch(`/admin/suppliers/${id}/restock-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-orders", id] })
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
  const supplierData = supplier?.supplier

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="transparent" 
            size="small"
            onClick={() => navigate(`/a/suppliers/${id}`)}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <ShoppingBag className="text-ui-fg-subtle" />
          <div>
            <Heading level="h1">Restock Orders</Heading>
            {supplierData && (
              <Text size="small" className="text-ui-fg-subtle">
                {supplierData.company_name}
              </Text>
            )}
          </div>
        </div>
        <Button 
          variant="primary" 
          size="small"
          onClick={() => navigate(`/a/suppliers/${id}/restock-orders/new`)}
        >
          <Plus className="mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4">
        <div className="flex gap-4 mb-4">
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
              <Select.Item value="delivered">Delivered</Select.Item>
              <Select.Item value="cancelled">Cancelled</Select.Item>
            </Select.Content>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Total Orders</Text>
            <Text size="large" weight="plus">{restockOrders?.count || 0}</Text>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Pending</Text>
            <Text size="large" weight="plus">
              {ordersList.filter(o => o.status === "pending").length}
            </Text>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Shipped</Text>
            <Text size="large" weight="plus">
              {ordersList.filter(o => o.status === "shipped").length}
            </Text>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <Text size="small" className="text-ui-fg-subtle">Delivered</Text>
            <Text size="large" weight="plus">
              {ordersList.filter(o => o.status === "delivered").length}
            </Text>
          </div>
        </div>

        {/* Restock Orders Table */}
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
              onClick={() => navigate(`/a/suppliers/${id}/restock-orders/new`)}
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
                  <Table.HeaderCell>Total Amount</Table.HeaderCell>
                  <Table.HeaderCell>Items</Table.HeaderCell>
                  <Table.HeaderCell>Expected Delivery</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ordersList.map((order: RestockOrder) => (
                  <Table.Row key={order.id}>
                    <Table.Cell>
                      <Text size="small" weight="plus">#{order.id.slice(-8)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      {getStatusBadge(order.status)}
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: order.currency_code.toUpperCase(),
                        }).format(order.total_amount)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{order.items.length} items</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {order.expected_delivery_date 
                          ? new Date(order.expected_delivery_date).toLocaleDateString()
                          : "Not set"
                        }
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {new Date(order.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-1">
                        <Button 
                          variant="transparent" 
                          size="small"
                          onClick={() => navigate(`/a/suppliers/${id}/restock-orders/${order.id}`)}
                        >
                          View
                        </Button>
                        {getStatusOptions(order.status).length > 0 && (
                          <Select
                            onValueChange={(status) => {
                              if (confirm(`Are you sure you want to update the status to ${status}?`)) {
                                updateStatusMutation.mutate({ orderId: order.id, status })
                              }
                            }}
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

// Route configuration for restock orders page
export const config = defineRouteConfig({
  label: "Restock Orders",
  icon: ShoppingBag,
})

export default RestockOrdersPage 