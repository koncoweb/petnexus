import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Input,
  Select,
  Textarea,
  Checkbox,
} from "@medusajs/ui"
import { Buildings, ArrowLeft, Pencil } from "@medusajs/icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
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

const EditSupplierPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Supplier>({
    id: "",
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    tax_id: "",
    payment_terms: "",
    status: "active",
    notes: "",
    website: "",
    whatsapp_number: "",
    auto_restock_enabled: false,
    ai_restock_threshold: 10,
    created_at: "",
    updated_at: "",
  })

  // Fetch supplier details
  const { data: supplier, isLoading } = useQuery<{ supplier: Supplier }>({
    queryKey: ["supplier", id],
    queryFn: async (): Promise<{ supplier: Supplier }> => {
      const response = await fetch(`/admin/suppliers/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch supplier")
      }
      return response.json()
    },
  })

  // Update form data when supplier is loaded
  useEffect(() => {
    if (supplier?.supplier) {
      setFormData(supplier.supplier)
    }
  }, [supplier])

  const updateSupplierMutation = useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      const response = await fetch(`/admin/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update supplier")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier", id] })
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      navigate(`/suppliers/${id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { id: _, created_at, updated_at, ...updateData } = formData
    updateSupplierMutation.mutate(updateData)
  }

  const handleInputChange = (field: keyof Supplier, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <Heading level="h2">Edit Supplier</Heading>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <Heading level="h3" className="mb-4">Basic Information</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Company Name *</Text>
                <Input
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Contact Person</Text>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange("contact_person", e.target.value)}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Email *</Text>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Phone</Text>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Website</Text>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="Enter website URL"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">WhatsApp Number</Text>
                <Input
                  value={formData.whatsapp_number}
                  onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                  placeholder="Enter WhatsApp number"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <Heading level="h3" className="mb-4">Address</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Text size="small" className="text-ui-fg-subtle mb-2">Address</Text>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">City</Text>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">State/Province</Text>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state or province"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Country</Text>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Postal Code</Text>
                <Input
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <Heading level="h3" className="mb-4">Business Information</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Tax ID</Text>
                <Input
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange("tax_id", e.target.value)}
                  placeholder="Enter tax identification number"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Payment Terms</Text>
                <Input
                  value={formData.payment_terms}
                  onChange={(e) => handleInputChange("payment_terms", e.target.value)}
                  placeholder="e.g., Net 30, Net 60"
                />
              </div>
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-2">Status</Text>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="active">Active</Select.Item>
                    <Select.Item value="inactive">Inactive</Select.Item>
                    <Select.Item value="suspended">Suspended</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>
          </div>

          {/* Auto-restock Settings */}
          <div>
            <Heading level="h3" className="mb-4">Auto-restock Settings</Heading>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.auto_restock_enabled}
                  onCheckedChange={(checked) => handleInputChange("auto_restock_enabled", checked)}
                />
                <Text size="small">Enable AI auto-restock</Text>
              </div>
              {formData.auto_restock_enabled && (
                <div>
                  <Text size="small" className="text-ui-fg-subtle mb-2">Restock Threshold</Text>
                  <Input
                    type="number"
                    min="0"
                    value={formData.ai_restock_threshold}
                    onChange={(e) => handleInputChange("ai_restock_threshold", parseInt(e.target.value) || 0)}
                    placeholder="Minimum stock level to trigger restock"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Heading level="h3" className="mb-4">Notes</Heading>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter any additional notes about this supplier"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => navigate(`/suppliers/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              disabled={updateSupplierMutation.isPending}
            >
              <Pencil className="mr-2" />
              {updateSupplierMutation.isPending ? "Updating..." : "Update Supplier"}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Edit Supplier",
  icon: Pencil,
})

export default EditSupplierPage 