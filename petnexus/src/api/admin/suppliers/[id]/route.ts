import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const updateSupplierSchema = z.object({
  company_name: z.string().min(1, "Company name is required").optional(),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  tax_id: z.string().optional(),
  payment_terms: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  notes: z.string().optional(),
  website: z.string().optional(),
  whatsapp_number: z.string().optional(),
  auto_restock_enabled: z.boolean().optional(),
  ai_restock_threshold: z.number().min(0).optional(),
})

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params
    const query = req.scope.resolve("query")

    const { data: suppliers } = await query.graph({
      entity: "supplier",
      fields: ["*"],
      filters: { id },
    })

    if (!suppliers || suppliers.length === 0) {
      return res.status(404).json({ error: "Supplier not found" })
    }

    res.json({ supplier: suppliers[0] })
  } catch (error) {
    console.error("Error fetching supplier:", error)
    res.status(500).json({ error: "Failed to fetch supplier" })
  }
}

export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params
    const data = updateSupplierSchema.parse(req.body)

    // Get the supplier service from the module
    const supplierService = req.scope.resolve("supplier") as any
    
    const supplier = await supplierService.updateSuppliers({
      id,
      ...data,
    })

    res.json({ supplier })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error updating supplier:", error)
      res.status(500).json({ error: "Failed to update supplier" })
    }
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params

    // Get the supplier service from the module
    const supplierService = req.scope.resolve("supplier") as any
    
    await supplierService.deleteSuppliers(id)

    res.status(204).send()
  } catch (error) {
    console.error("Error deleting supplier:", error)
    res.status(500).json({ error: "Failed to delete supplier" })
  }
} 