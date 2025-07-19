import { ShoppingBag, Clock, CheckCircle } from "@medusajs/icons"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

type Analytics = {
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalValue: number
  averageOrderValue: number
}

const RestockOrdersAnalyticsWidget = () => {
  const { data: analyticsData, isLoading, error } = useQuery<{ analytics: Analytics }>({
    queryKey: ["restock-orders-analytics"],
    queryFn: async (): Promise<{ analytics: Analytics }> => {
      try {
        const response = await sdk.client.fetch("/admin/restock-orders/analytics")
        return response as { analytics: Analytics }
      } catch (error) {
        console.warn("Failed to fetch restock orders analytics:", error)
        return {
          analytics: {
            totalOrders: 0,
            pendingOrders: 0,
            confirmedOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            totalValue: 0,
            averageOrderValue: 0,
          }
        }
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  })

  const analytics = analyticsData?.analytics

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Container className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="text-ui-fg-subtle" />
          <Heading level="h3">Restock Orders Analytics</Heading>
        </div>
        <Text size="small" className="text-ui-fg-subtle">Loading analytics...</Text>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="text-ui-fg-subtle" />
          <Heading level="h3">Restock Orders Analytics</Heading>
        </div>
        <Text size="small" className="text-ui-fg-subtle">Failed to load analytics</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="text-ui-fg-subtle" />
        <Heading level="h3">Restock Orders Analytics</Heading>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <Text size="small" className="text-blue-600 font-medium">Total Orders</Text>
          </div>
          <Text size="large" weight="plus" className="text-blue-900">
            {analytics?.totalOrders || 0}
          </Text>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-green-600" />
            <Text size="small" className="text-green-600 font-medium">Total Value</Text>
          </div>
          <Text size="large" weight="plus" className="text-green-900">
            {formatCurrency(analytics?.totalValue || 0)}
          </Text>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-purple-600" />
            <Text size="small" className="text-purple-600 font-medium">Avg Order Value</Text>
          </div>
          <Text size="large" weight="plus" className="text-purple-900">
            {formatCurrency(analytics?.averageOrderValue || 0)}
          </Text>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <Text size="small" className="text-orange-600 font-medium">Pending Orders</Text>
          </div>
          <Text size="large" weight="plus" className="text-orange-900">
            {analytics?.pendingOrders || 0}
          </Text>
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <Heading level="h3" className="mb-4">Order Status Breakdown</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Badge className={`${getStatusColor("pending")} mb-2`}>
              Pending
            </Badge>
            <Text size="large" weight="plus" className="text-yellow-900">
              {analytics?.pendingOrders || 0}
            </Text>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Badge className={`${getStatusColor("confirmed")} mb-2`}>
              Confirmed
            </Badge>
            <Text size="large" weight="plus" className="text-blue-900">
              {analytics?.confirmedOrders || 0}
            </Text>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Badge className={`${getStatusColor("shipped")} mb-2`}>
              Shipped
            </Badge>
            <Text size="large" weight="plus" className="text-purple-900">
              {analytics?.shippedOrders || 0}
            </Text>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Badge className={`${getStatusColor("delivered")} mb-2`}>
              Delivered
            </Badge>
            <Text size="large" weight="plus" className="text-green-900">
              {analytics?.deliveredOrders || 0}
            </Text>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Badge className={`${getStatusColor("cancelled")} mb-2`}>
              Cancelled
            </Badge>
            <Text size="large" weight="plus" className="text-red-900">
              {analytics?.cancelledOrders || 0}
            </Text>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && analytics.totalOrders > 0 && (
        <div className="mt-6 pt-6 border-t">
          <Heading level="h3" className="mb-4">Quick Stats</Heading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Text size="small" className="text-ui-fg-subtle">Completion Rate</Text>
              <Text size="large" weight="plus" className="text-green-600">
                {Math.round(((analytics.deliveredOrders / analytics.totalOrders) * 100))}%
              </Text>
            </div>
            <div className="text-center">
              <Text size="small" className="text-ui-fg-subtle">Cancellation Rate</Text>
              <Text size="large" weight="plus" className="text-red-600">
                {Math.round(((analytics.cancelledOrders / analytics.totalOrders) * 100))}%
              </Text>
            </div>
            <div className="text-center">
              <Text size="small" className="text-ui-fg-subtle">Active Orders</Text>
              <Text size="large" weight="plus" className="text-blue-600">
                {analytics.pendingOrders + analytics.confirmedOrders + analytics.shippedOrders}
              </Text>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export default RestockOrdersAnalyticsWidget 