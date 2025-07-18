import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Container, 
  Text, 
  Badge, 
  Button, 
  Heading,
} from "@medusajs/ui"
import { Plus, ShoppingBag, Users, Buildings } from "@medusajs/icons"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

type Supplier = {
  id: string
  company_name: string
  status: string
  pending_restock_count?: number
}

type SuppliersResponse = {
  suppliers: Supplier[]
  count: number
}

const SupplierOverviewWidget = () => {
  const navigate = useNavigate()
  
  const { data: suppliers, isLoading } = useQuery<SuppliersResponse>({
    queryKey: ["suppliers-overview"],
    queryFn: async () => {
      const response = await fetch("/admin/suppliers")
      return response.json()
    },
  })

  const activeSuppliers = suppliers?.suppliers?.filter((s: Supplier) => s.status === "active")?.length || 0
  const totalSuppliers = suppliers?.suppliers?.length || 0
  const pendingRestocks = suppliers?.suppliers?.filter((s: Supplier) => (s.pending_restock_count || 0) > 0)?.length || 0

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Buildings className="text-ui-fg-subtle" />
          <Heading level="h2">Supplier Management</Heading>
        </div>
        <Button 
          variant="secondary" 
          size="small"
          onClick={() => navigate("/a/suppliers")}
        >
          <Plus className="mr-2" />
          Add Supplier
        </Button>
      </div>

      {isLoading ? (
        <div className="px-6 py-4">
          <Text>Loading supplier data...</Text>
        </div>
      ) : (
        <div className="px-6 py-4">
          <div className="space-y-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Total Suppliers</Text>
                    <Text size="large" weight="plus">{totalSuppliers}</Text>
                  </div>
                  <Users className="text-ui-fg-subtle" />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Active Suppliers</Text>
                    <Text size="large" weight="plus">{activeSuppliers}</Text>
                  </div>
                  <Buildings className="text-ui-fg-subtle" />
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(activeSuppliers / Math.max(totalSuppliers, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <Text size="small" className="text-ui-fg-subtle">Pending Restocks</Text>
                    <Text size="large" weight="plus">{pendingRestocks}</Text>
                  </div>
                  <ShoppingBag className="text-ui-fg-subtle" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => navigate("/a/suppliers/restock-orders")}
              >
                <ShoppingBag className="mr-2" />
                View Restock Orders
              </Button>
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => navigate("/a/suppliers/analytics")}
              >
                <Buildings className="mr-2" />
                Supplier Analytics
              </Button>
            </div>

            {/* Recent Activity */}
            <div>
              <Text size="small" weight="plus" className="mb-2">Recent Activity</Text>
              <div className="space-y-2">
                {suppliers?.suppliers?.slice(0, 3).map((supplier: Supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between p-2 bg-ui-bg-subtle rounded">
                    <div>
                      <Text size="small" weight="plus">{supplier.company_name}</Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        Status: <Badge className={supplier.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {supplier.status}
                        </Badge>
                      </Text>
                    </div>
                    <Button 
                      variant="transparent" 
                      size="small"
                      onClick={() => navigate(`/a/suppliers/${supplier.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.after",
})

export default SupplierOverviewWidget 