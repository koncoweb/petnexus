import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag, Plus, Calendar } from "@medusajs/icons"
import { Container, Heading, Button, Badge, Text, Table, Select } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

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

type RestockOrdersResponse = {
  restock_orders: RestockOrder[]
  count: number
  page: number
  limit: number
}

const RestockOrdersPage = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const limit = 15
  const offset = useMemo(() => {
    return currentPage * limit
  }, [currentPage])

  const { data, isLoading } = useQuery<RestockOrdersResponse>({
    queryFn: () => sdk.client.fetch(`/admin/restock-orders`, {
      query: {
        limit,
        page: currentPage + 1,
        status: statusFilter !== "all" ? statusFilter : undefined,
      },
    }),
    queryKey: [["restock-orders", limit, currentPage, statusFilter]],
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Restock Orders</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Manage inventory restocking operations and track supplier orders
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={() => navigate("/restock-orders/new")}
        >
          <Plus />
          Create Order
        </Button>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Text size="small" className="text-ui-fg-subtle">Status:</Text>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              size="small"
            >
              <Select.Trigger className="w-32">
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
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Text>Loading restock orders...</Text>
          </div>
        ) : (
          <>
            {data?.restock_orders && data.restock_orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Order ID</Table.HeaderCell>
                      <Table.HeaderCell>Supplier</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>Items</Table.HeaderCell>
                      <Table.HeaderCell>Total Cost</Table.HeaderCell>
                      <Table.HeaderCell>Expected Delivery</Table.HeaderCell>
                      <Table.HeaderCell>Created</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.restock_orders.map((order) => (
                      <Table.Row key={order.id}>
                        <Table.Cell>
                          <Text size="small" weight="plus" className="font-mono">
                            {order.id.slice(0, 8)}...
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small">
                            {order.supplier_name || `Supplier ${order.supplier_id.slice(0, 8)}`}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(order.status)}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-ui-fg-subtle" />
                            <Text size="small">{order.total_items}</Text>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-1">
                            <Text size="small">
                              {formatCurrency(order.total_cost, order.currency_code)}
                            </Text>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          {order.expected_delivery_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-ui-fg-subtle" />
                              <Text size="small">
                                {formatDate(order.expected_delivery_date)}
                              </Text>
                            </div>
                          ) : (
                            <Text size="small" className="text-ui-fg-subtle">-</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small">
                            {formatDate(order.created_at)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => navigate(`/restock-orders/${order.id}`)}
                          >
                            View
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>

                {/* Pagination */}
                {data && data.count > limit && (
                  <div className="flex justify-between items-center mt-6">
                    <Text size="small" className="text-ui-fg-subtle">
                      Showing {offset + 1} to {Math.min(offset + limit, data.count)} of {data.count} orders
                    </Text>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={offset + limit >= data.count}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto mb-4 text-ui-fg-subtle" />
                <Text size="small" className="text-ui-fg-subtle">
                  No restock orders found. Create your first order to get started.
                </Text>
                <Button 
                  variant="secondary" 
                  size="small" 
                  className="mt-4"
                  onClick={() => navigate("/restock-orders/new")}
                >
                  <Plus className="mr-2" />
                  Create First Order
                </Button>
              </div>
            )}
          </>
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