import { z } from "zod"

// Schema for creating a brand
export const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100, "Brand name must be less than 100 characters"),
  description: z.string().max(500, "Brand description must be less than 500 characters").optional(),
  logo_url: z.string().url("Invalid logo URL format").optional(),
  website_url: z.string().url("Invalid website URL format").optional(),
})

// Schema for updating a brand
export const updateBrandSchema = z.object({
  name: z.string().min(1, "Brand name cannot be empty").max(100, "Brand name must be less than 100 characters").optional(),
  description: z.string().max(500, "Brand description must be less than 500 characters").optional(),
  logo_url: z.string().url("Invalid logo URL format").optional(),
  website_url: z.string().url("Invalid website URL format").optional(),
})

// Schema for brand ID parameter
export const brandIdSchema = z.object({
  id: z.string().min(1, "Brand ID is required"),
})

// Type exports
export type CreateBrandInput = z.infer<typeof createBrandSchema>
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>
export type BrandIdParam = z.infer<typeof brandIdSchema> 