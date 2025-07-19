import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SMART_RESTOCK_MODULE } from "../../../../../modules/smart-restock"
import SmartRestockService from "../../../../../modules/smart-restock/service"

const deliverySchema = z.object({
  store_id: z.string().default("default-store"),
  delivery_notes: z.string().optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id: orderId } = req.params
    const data = deliverySchema.parse(req.body)

    const smartRestockService: SmartRestockService = req.scope.resolve(SMART_RESTOCK_MODULE)
    
    const result = await smartRestockService.processRestockOrderDelivery(
      orderId,
      data.store_id
    )

    res.status(200).json({
      success: true,
      result,
      message: "Restock order delivery processed successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error processing restock order delivery:", error)
      res.status(500).json({
        error: "Failed to process restock order delivery",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
} 