import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import SupplierModuleService from "../../../modules/supplier/service"

const createSupplierSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  tax_id: z.string().optional(),
  payment_terms: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  notes: z.string().optional(),
  website: z.string().optional(),
  whatsapp_number: z.string().optional(),
  auto_restock_enabled: z.boolean().default(false),
  ai_restock_threshold: z.number().min(0).default(10),
})

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { q, status, page = 1, limit = 20 } = req.query
    const query = req.scope.resolve("query")

    // Build where clause
    const where: any = {}
    if (q) {
      where.company_name = { $like: `%${q}%` }
    }
    if (status && status !== 'all') {
      where.status = status
    }

    const { data: suppliers, metadata } = await query.graph({
      entity: "supplier",
      fields: ["*"],
      filters: where,
      pagination: {
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      },
    })

    res.json({
      suppliers,
      count: metadata?.count || 0,
      page: Number(page),
      limit: Number(limit),
    })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    res.status(500).json({ error: "Failed to fetch suppliers" })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const data = createSupplierSchema.parse(req.body)
    
    // Get the supplier service from the module
    const supplierService = req.scope.resolve("supplier") as any
    
    const supplier = await supplierService.createSuppliers(data)

    res.status(201).json({ supplier })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error creating supplier:", error)
      res.status(500).json({ error: "Failed to create supplier" })
    }
  }
} 