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
import { Buildings, ArrowLeft, Plus } from "@medusajs/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"

type SupplierFormData = {
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
}

const NewSupplierPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<SupplierFormData>({
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
  })

  // Create supplier mutation
  const createMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      const response = await fetch("/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to create supplier")
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      navigate(`/a/suppliers/${data.supplier.id}`)
    },
  })

  const handleInputChange = (field: keyof SupplierFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

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
          <Heading level="h1">New Supplier</Heading>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <Heading level="h2">Basic Information</Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Company Name *</Text>
                <Input
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Contact Person</Text>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange("contact_person", e.target.value)}
                  placeholder="Enter contact person name"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Email *</Text>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Phone</Text>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Website</Text>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="Enter website URL"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">WhatsApp</Text>
                <Input
                  value={formData.whatsapp_number}
                  onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                  placeholder="Enter WhatsApp number"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <Heading level="h2">Address Information</Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Text size="small" weight="plus" className="mb-2 block">Address</Text>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">City</Text>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">State/Province</Text>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state or province"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Country</Text>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Postal Code</Text>
                <Input
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <Heading level="h2">Business Information</Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Tax ID</Text>
                <Input
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange("tax_id", e.target.value)}
                  placeholder="Enter tax ID"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Payment Terms</Text>
                <Input
                  value={formData.payment_terms}
                  onChange={(e) => handleInputChange("payment_terms", e.target.value)}
                  placeholder="e.g., Net 30"
                />
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">Status</Text>
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

          {/* Restock Settings */}
          <div className="space-y-4">
            <Heading level="h2">Restock Settings</Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    checked={formData.auto_restock_enabled}
                    onCheckedChange={(checked) => handleInputChange("auto_restock_enabled", checked)}
                  />
                  <Text size="small" weight="plus">Enable Auto Restock</Text>
                </div>
                <Text size="small" className="text-ui-fg-subtle">
                  Automatically create restock orders when inventory is low
                </Text>
              </div>
              
              <div>
                <Text size="small" weight="plus" className="mb-2 block">AI Restock Threshold</Text>
                <Input
                  type="number"
                  value={formData.ai_restock_threshold}
                  onChange={(e) => handleInputChange("ai_restock_threshold", parseInt(e.target.value) || 0)}
                  placeholder="Enter threshold value"
                  min="0"
                />
                <Text size="small" className="text-ui-fg-subtle">
                  Minimum stock level before auto-restock triggers
                </Text>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <Heading level="h2">Notes</Heading>
            
            <div>
              <Text size="small" weight="plus" className="mb-2 block">Additional Notes</Text>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Enter any additional notes about this supplier"
                rows={4}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              variant="primary"
              disabled={createMutation.isPending}
            >
              <Plus className="mr-2" />
              {createMutation.isPending ? "Creating..." : "Create Supplier"}
            </Button>
            
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate("/a/suppliers")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Container>
  )
}

// Route configuration for new supplier form
export const config = defineRouteConfig({
  label: "New Supplier",
  icon: Plus,
})

export default NewSupplierPage 