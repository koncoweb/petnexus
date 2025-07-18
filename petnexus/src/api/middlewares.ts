import { defineMiddlewares } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

// Logger middleware
async function logger(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
}

// Validation middleware factory
function createValidationMiddleware(schema: any) {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    try {
      const data = req.method === "GET" ? req.query : req.body
      await schema.parseAsync(data)
      next()
    } catch (error: any) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors || error.message,
      })
    }
  }
}

// Error handling middleware
async function errorHandler(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    await next()
  } catch (error: any) {
    console.error("API Error:", error)
    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Something went wrong",
    })
  }
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/brands",
      middlewares: [logger, errorHandler],
    },
    {
      matcher: "/admin/brands/:id",
      middlewares: [logger, errorHandler],
    },
    {
      matcher: "/store/brands",
      middlewares: [logger, errorHandler],
    },
    {
      matcher: "/admin/suppliers",
      middlewares: [logger, errorHandler],
    },
    {
      matcher: "/admin/suppliers/:id",
      middlewares: [logger, errorHandler],
    },
    {
      matcher: "/admin/suppliers/:id/restock-orders",
      middlewares: [logger, errorHandler],
    },
    {
      matcher: "/admin/restock-orders",
      middlewares: [logger, errorHandler],
    },
    {
      matcher: "/admin/restock-orders/:id",
      middlewares: [logger, errorHandler],
    },
  ],
}) 