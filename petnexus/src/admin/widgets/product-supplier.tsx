import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Badge,
  Select,
  Divider,
} from "@medusajs/ui"
import { Buildings, ShoppingBag, Link } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

const ProductSupplierWidget = ({ 
  data: product,
}: DetailWidgetProps<any>) => {
  const queryClient = useQueryClient()
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await fetch("/admin/suppliers")
      return response.json()
    },
  })

  // Fetch product's current supplier
  const { data: productSupplier } = useQuery({
    queryKey: ["product-supplier", product.id],
    queryFn: async () => {
      const response = await fetch(`/admin/products/${product.id}?fields=+supplier.*`)
      return response.json()
    },
  })

  // Link product to supplier
  const linkMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      const response = await fetch(`/admin/products/${product.id}/supplier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: supplierId }),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-supplier", product.id] })
      setSelectedSupplier("")
    },
  })

  // Unlink product from supplier
  const unlinkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/admin/products/${product.id}/supplier`, {
        method: "DELETE",
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-supplier", product.id] })
    },
  })

  const currentSupplier = productSupplier?.product?.supplier

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Buildings className="text-ui-fg-subtle" />
          <Heading level="h2">Supplier Information</Heading>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="space-y-4">
          {/* Current Supplier */}
          {currentSupplier ? (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <Text size="small" weight="plus" className="mb-1">Current Supplier</Text>
                  <Text size="large">{currentSupplier.company_name}</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {currentSupplier.contact_person} • {currentSupplier.email}
                  </Text>
                  <Badge className={currentSupplier.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {currentSupplier.status}
                  </Badge>
                </div>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => unlinkMutation.mutate()}
                  disabled={unlinkMutation.isPending}
                >
                  <Link className="mr-2" />
                  Unlink
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-center py-4">
                <ShoppingBag className="mx-auto mb-2 text-ui-fg-subtle" />
                <Text size="small" className="text-ui-fg-subtle">No supplier assigned</Text>
              </div>
            </div>
          )}

          <Divider />

          {/* Link to Supplier */}
          <div>
            <Text size="small" weight="plus" className="mb-2">Link to Supplier</Text>
            <div className="flex gap-2">
              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select a supplier..." />
                </Select.Trigger>
                <Select.Content>
                  {suppliers?.suppliers?.map((supplier: any) => (
                    <Select.Item key={supplier.id} value={supplier.id}>
                      {supplier.company_name} ({supplier.status})
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Button 
                variant="secondary"
                size="small"
                onClick={() => linkMutation.mutate(selectedSupplier)}
                disabled={!selectedSupplier || linkMutation.isPending}
              >
                <Link className="mr-2" />
                Link
              </Button>
            </div>
          </div>

          {/* Supplier Actions */}
          {currentSupplier && (
            <>
              <Divider />
              <div>
                <Text size="small" weight="plus" className="mb-2">Supplier Actions</Text>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => window.open(`/a/suppliers/${currentSupplier.id}`, '_blank')}
                  >
                    <Buildings className="mr-2" />
                    View Supplier
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => window.open(`/a/suppliers/${currentSupplier.id}/restock-orders`, '_blank')}
                  >
                    <ShoppingBag className="mr-2" />
                    Restock Orders
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductSupplierWidget 