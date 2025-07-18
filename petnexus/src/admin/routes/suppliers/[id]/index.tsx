import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Badge,
  Divider,
} from "@medusajs/ui"
import { Buildings, ShoppingBag, ArrowLeft } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { defineRouteConfig } from "@medusajs/admin-sdk"

type Supplier = {
  id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  tax_id: string
  payment_terms: string
  status: "active" | "inactive" | "suspended"
  notes: string
  website: string
  whatsapp_number: string
  auto_restock_enabled: boolean
  ai_restock_threshold: number
  created_at: string
  updated_at: string
}

const SupplierDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Fetch supplier details
  const { data: supplier, isLoading, error } = useQuery<{ supplier: Supplier }>({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const response = await fetch(`/admin/suppliers/${id}`)
      if (!response.ok) {
        throw new Error("Supplier not found")
      }
      return response.json()
    },
  })

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
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
            <Button 
              variant="secondary" 
              size="small" 
              className="mt-2"
              onClick={() => navigate("/a/suppliers")}
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
            onClick={() => navigate("/a/suppliers")}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <Buildings className="text-ui-fg-subtle" />
          <Heading level="h1">{supplierData.company_name}</Heading>
          {getStatusBadge(supplierData.status)}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => navigate(`/a/suppliers/${id}/edit`)}
          >
            Edit
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => navigate(`/a/suppliers/${id}/restock-orders`)}
          >
            <ShoppingBag className="mr-2" />
            Restock Orders
          </Button>
        </div>
      </div>

      {/* Supplier Details */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <Heading level="h2">Basic Information</Heading>
            
            <div className="space-y-3">
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">Company Name</Text>
                <Text>{supplierData.company_name}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">Contact Person</Text>
                <Text>{supplierData.contact_person || "Not specified"}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">Email</Text>
                <Text>{supplierData.email}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">Phone</Text>
                <Text>{supplierData.phone || "Not specified"}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">Website</Text>
                <Text>{supplierData.website || "Not specified"}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">WhatsApp</Text>
                <Text>{supplierData.whatsapp_number || "Not specified"}</Text>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <Heading level="h2">Address Information</Heading>
            
            <div className="space-y-3">
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">Address</Text>
                <Text>{supplierData.address || "Not specified"}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">City</Text>
                <Text>{supplierData.city || "Not specified"}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">State/Province</Text>
                <Text>{supplierData.state || "Not specified"}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">Country</Text>
                <Text>{supplierData.country || "Not specified"}</Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">Postal Code</Text>
                <Text>{supplierData.postal_code || "Not specified"}</Text>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Business Information */}
        <div className="space-y-4">
          <Heading level="h2">Business Information</Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle">Tax ID</Text>
              <Text>{supplierData.tax_id || "Not specified"}</Text>
            </div>
            
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle">Payment Terms</Text>
              <Text>{supplierData.payment_terms || "Not specified"}</Text>
            </div>
            
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle">Status</Text>
              {getStatusBadge(supplierData.status)}
            </div>
          </div>
        </div>

        <Divider />

        {/* Restock Settings */}
        <div className="space-y-4">
          <Heading level="h2">Restock Settings</Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle">Auto Restock</Text>
              <Badge className={supplierData.auto_restock_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {supplierData.auto_restock_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle">AI Restock Threshold</Text>
              <Text>{supplierData.ai_restock_threshold} units</Text>
            </div>
          </div>
        </div>

        {supplierData.notes && (
          <>
            <Divider />
            <div className="space-y-4">
              <Heading level="h2">Notes</Heading>
              <Text className="whitespace-pre-wrap">{supplierData.notes}</Text>
            </div>
          </>
        )}

        <Divider />

        {/* Timestamps */}
        <div className="space-y-4">
          <Heading level="h2">Timestamps</Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle">Created</Text>
              <Text>{new Date(supplierData.created_at).toLocaleString()}</Text>
            </div>
            
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle">Last Updated</Text>
              <Text>{new Date(supplierData.updated_at).toLocaleString()}</Text>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

// Route configuration for detail page
export const config = defineRouteConfig({
  label: "Supplier Details",
  icon: Buildings,
})

export default SupplierDetailPage 