import { Buildings, ArrowLeft, Pencil, ShoppingBag, Link } from "@medusajs/icons"
import { Container, Heading, Button, Badge, Text, Divider } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { sdk } from "../../../lib/sdk"

type Supplier = {
  id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  website: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

const SupplierDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Fetch supplier details
  const { data: supplier, isLoading, error } = useQuery<{ supplier: Supplier }>({
    queryKey: ["supplier", id],
    queryFn: async (): Promise<{ supplier: Supplier }> => {
      try {
        const response = await sdk.client.fetch(`/admin/suppliers/${id}`)
        return response as { supplier: Supplier }
      } catch (error) {
        console.error("Error fetching supplier:", error)
        throw new Error(`Failed to fetch supplier: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
    retry: 1,
  })

  // Fetch linked products
  const { data: linkedProducts } = useQuery<{ products: any[] }>({
    queryKey: ["supplier-products", id],
    queryFn: async (): Promise<{ products: any[] }> => {
      try {
        const response = await sdk.client.fetch(`/admin/suppliers/${id}/products`)
        return response as { products: any[] }
      } catch (error) {
        console.warn("Failed to fetch supplier products:", error)
        return { products: [] }
      }
    },
    retry: 1,
  })

  // Fetch restock orders
  const { data: restockOrders } = useQuery<{ orders: any[] }>({
    queryKey: ["supplier-restock-orders", id],
    queryFn: async (): Promise<{ orders: any[] }> => {
      try {
        const response = await sdk.client.fetch(`/admin/suppliers/${id}/restock-orders`)
        return response as { orders: any[] }
      } catch (error) {
        console.warn("Failed to fetch supplier restock orders:", error)
        return { orders: [] }
      }
    },
    retry: 1,
  })

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-yellow-100 text-yellow-800",
    }
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Text>Loading supplier details...</Text>
        </div>
      </Container>
    )
  }

  if (error || !supplier) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <div className="text-center py-8">
            <Buildings className="mx-auto mb-4 text-ui-fg-subtle" />
            <Text size="small" className="text-ui-fg-subtle">Supplier not found</Text>
            {error && (
              <Text size="small" className="text-ui-fg-subtle mt-2">
                Error: {error.message}
              </Text>
            )}
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Supplier ID: {id}
            </Text>
            <Button 
              variant="secondary" 
              size="small" 
              className="mt-2"
              onClick={() => navigate("/suppliers")}
            >
              <ArrowLeft className="mr-2" />
              Back to Suppliers
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  const supplierData = supplier.supplier

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="transparent" 
            size="small"
            onClick={() => navigate("/suppliers")}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <Buildings className="text-ui-fg-subtle" />
          <Heading level="h2">{supplierData.company_name}</Heading>
          {getStatusBadge(supplierData.status)}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => navigate(`/suppliers/${id}/edit`)}
          >
            <Pencil className="mr-2" />
            Edit
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => navigate(`/suppliers/${id}/restock-orders`)}
          >
            <ShoppingBag className="mr-2" />
            Restock Orders
          </Button>
        </div>
      </div>

      {/* Supplier Details */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <Heading level="h3" className="mb-4">Basic Information</Heading>
              <div className="space-y-3">
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Company Name</Text>
                  <Text size="small" weight="plus">{supplierData.company_name}</Text>
                </div>
                {supplierData.contact_person && (
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Contact Person</Text>
                    <Text size="small">{supplierData.contact_person}</Text>
                  </div>
                )}
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Email</Text>
                  <Text size="small">{supplierData.email}</Text>
                </div>
                {supplierData.phone && (
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Phone</Text>
                    <Text size="small">{supplierData.phone}</Text>
                  </div>
                )}
                {supplierData.website && (
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Website</Text>
                    <Text size="small">{supplierData.website}</Text>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {(supplierData.address || supplierData.city || supplierData.state || supplierData.country) && (
              <div>
                <Heading level="h3" className="mb-4">Address</Heading>
                <div className="space-y-3">
                  {supplierData.address && (
                    <div>
                      <Text size="small" className="text-ui-fg-subtle">Address</Text>
                      <Text size="small">{supplierData.address}</Text>
                    </div>
                  )}
                  {(supplierData.city || supplierData.state || supplierData.postal_code) && (
                    <div>
                      <Text size="small" className="text-ui-fg-subtle">City/State/Postal Code</Text>
                      <Text size="small">
                        {[supplierData.city, supplierData.state, supplierData.postal_code]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </div>
                  )}
                  {supplierData.country && (
                    <div>
                      <Text size="small" className="text-ui-fg-subtle">Country</Text>
                      <Text size="small">{supplierData.country}</Text>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            {/* Notes */}
            {supplierData.notes && (
              <div>
                <Heading level="h3" className="mb-4">Notes</Heading>
                <Text size="small">{supplierData.notes}</Text>
              </div>
            )}

            {/* Linked Products */}
            <div>
              <Heading level="h3" className="mb-4">Linked Products</Heading>
              {linkedProducts?.products && linkedProducts.products.length > 0 ? (
                <div className="space-y-2">
                  {linkedProducts.products.slice(0, 5).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <Text size="small" weight="plus">{product.title}</Text>
                        <Text size="small" className="text-ui-fg-subtle">SKU: {product.handle}</Text>
                      </div>
                      <Button 
                        variant="transparent" 
                        size="small"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  {linkedProducts.products.length > 5 && (
                    <Text size="small" className="text-ui-fg-subtle">
                      +{linkedProducts.products.length - 5} more products
                    </Text>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Link className="mx-auto mb-2 text-ui-fg-subtle" />
                  <Text size="small" className="text-ui-fg-subtle">No products linked</Text>
                </div>
              )}
            </div>

            {/* Recent Restock Orders */}
            <div>
              <Heading level="h3" className="mb-4">Recent Restock Orders</Heading>
              {restockOrders?.orders && restockOrders.orders.length > 0 ? (
                <div className="space-y-2">
                  {restockOrders.orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <Text size="small" weight="plus">#{order.id}</Text>
                        <Text size="small" className="text-ui-fg-subtle">
                          {new Date(order.created_at).toLocaleDateString()}
                        </Text>
                      </div>
                      <Badge color={order.status === "delivered" ? "green" : "orange"}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                  {restockOrders.orders.length > 3 && (
                    <Button 
                      variant="transparent" 
                      size="small"
                      onClick={() => navigate(`/suppliers/${id}/restock-orders`)}
                    >
                      View all orders
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <ShoppingBag className="mx-auto mb-2 text-ui-fg-subtle" />
                  <Text size="small" className="text-ui-fg-subtle">No restock orders</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default SupplierDetailPage 