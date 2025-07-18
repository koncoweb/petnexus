# Medusa API Routes Guide

## Overview

This guide covers best practices for creating, managing, and integrating API routes in Medusa applications. It provides step-by-step instructions, code examples, and troubleshooting tips.

## Table of Contents

1. [API Route Structure](#api-route-structure)
2. [Creating API Routes](#creating-api-routes)
3. [Request/Response Handling](#requestresponse-handling)
4. [Validation](#validation)
5. [Error Handling](#error-handling)
6. [Authentication & Authorization](#authentication--authorization)
7. [Service Integration](#service-integration)
8. [Testing API Routes](#testing-api-routes)
9. [Best Practices](#best-practices)
10. [Examples](#examples)

## API Route Structure

### Directory Structure

```
src/api/
├── admin/                 # Admin API routes
│   ├── entities/         # Entity management
│   │   ├── route.ts      # List/Create entities
│   │   └── [id]/         # Individual entity operations
│   │       ├── route.ts  # Get/Update/Delete entity
│   │       └── action/   # Custom actions
│   └── custom/           # Custom admin endpoints
├── store/                # Store API routes
│   ├── entities/         # Public entity endpoints
│   └── custom/           # Custom store endpoints
└── middlewares.ts        # Global middleware
```

### Route File Structure

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

// Validation schemas
const createEntitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

// HTTP Methods
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Handle GET requests
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // Handle POST requests
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  // Handle PUT requests
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  // Handle DELETE requests
}
```

## Creating API Routes

### Basic Route

Create `src/api/admin/entities/route.ts`:

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const createEntitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Get query parameters
    const { limit = 10, offset = 0, status } = req.query
    
    // Resolve service
    const service = req.scope.resolve("entity-service")
    
    // Build query
    const where: any = {}
    if (status) where.status = status
    
    const entities = await service.listEntities({
      where,
      take: Number(limit),
      skip: Number(offset),
    })
    
    res.json({ entities })
  } catch (error) {
    console.error("Error fetching entities:", error)
    res.status(500).json({ 
      error: "Failed to fetch entities",
      details: error.message 
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Validate input
    const data = createEntitySchema.parse(req.body)
    
    // Resolve service
    const service = req.scope.resolve("entity-service")
    
    // Create entity
    const entity = await service.createEntities(data)
    
    res.status(201).json({ entity })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error creating entity:", error)
      res.status(500).json({ 
        error: "Failed to create entity",
        details: error.message 
      })
    }
  }
}
```

### Individual Entity Route

Create `src/api/admin/entities/[id]/route.ts`:

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const updateEntitySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    
    const service = req.scope.resolve("entity-service")
    const entity = await service.retrieveEntity(id)
    
    res.json({ entity })
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: "Entity not found" })
    } else {
      console.error("Error fetching entity:", error)
      res.status(500).json({ 
        error: "Failed to fetch entity",
        details: error.message 
      })
    }
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const data = updateEntitySchema.parse(req.body)
    
    const service = req.scope.resolve("entity-service")
    const entity = await service.updateEntities({ id, ...data })
    
    res.json({ entity })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else if (error.message.includes("not found")) {
      res.status(404).json({ error: "Entity not found" })
    } else {
      console.error("Error updating entity:", error)
      res.status(500).json({ 
        error: "Failed to update entity",
        details: error.message 
      })
    }
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    
    const service = req.scope.resolve("entity-service")
    await service.deleteEntities(id)
    
    res.status(204).send()
  } catch (error) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: "Entity not found" })
    } else {
      console.error("Error deleting entity:", error)
      res.status(500).json({ 
        error: "Failed to delete entity",
        details: error.message 
      })
    }
  }
}
```

## Request/Response Handling

### Request Parameters

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // URL parameters
  const { id } = req.params
  
  // Query parameters
  const { limit, offset, status, search } = req.query
  
  // Request body (for POST/PUT)
  const body = req.body
  
  // Headers
  const authorization = req.headers.authorization
  
  // User context (if authenticated)
  const user = req.user
}
```

### Response Handling

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = await fetchData()
    
    // Success responses
    res.json({ data })                    // 200 OK
    res.status(201).json({ data })        // 201 Created
    res.status(204).send()                // 204 No Content
    
    // Error responses
    res.status(400).json({ error: "Bad request" })
    res.status(401).json({ error: "Unauthorized" })
    res.status(403).json({ error: "Forbidden" })
    res.status(404).json({ error: "Not found" })
    res.status(500).json({ error: "Internal server error" })
  } catch (error) {
    // Handle errors
  }
}
```

### Pagination

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { limit = 10, offset = 0 } = req.query
    
    const service = req.scope.resolve("entity-service")
    const [entities, count] = await service.listAndCountEntities({
      take: Number(limit),
      skip: Number(offset),
    })
    
    res.json({
      entities,
      count,
      limit: Number(limit),
      offset: Number(offset),
      has_more: count > Number(offset) + entities.length,
    })
  } catch (error) {
    // Handle errors
  }
}
```

## Validation

### Input Validation with Zod

```typescript
import { z } from "zod"

// Basic validation
const createEntitySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email"),
  age: z.number().min(0).max(120),
  status: z.enum(["active", "inactive"]).default("active"),
})

// Complex validation
const updateEntitySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    settings: z.record(z.any()).optional(),
  }).optional(),
})

// Custom validation
const customSchema = z.object({
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and number"
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

### Validation in Routes

```typescript
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Validate input
    const data = createEntitySchema.parse(req.body)
    
    // Process validated data
    const service = req.scope.resolve("entity-service")
    const entity = await service.createEntities(data)
    
    res.status(201).json({ entity })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: "Validation failed",
        details: error.issues 
      })
    } else {
      res.status(500).json({ 
        error: "Internal server error",
        details: error.message 
      })
    }
  }
}
```

## Error Handling

### Global Error Handling

Create `src/api/middlewares.ts`:

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function errorHandler(
  error: Error,
  req: MedusaRequest,
  res: MedusaResponse
) {
  console.error("API Error:", error)
  
  if (error.name === "ValidationError") {
    res.status(400).json({ error: error.message })
  } else if (error.name === "NotFoundError") {
    res.status(404).json({ error: "Resource not found" })
  } else if (error.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized" })
  } else {
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    })
  }
}
```

### Route-Level Error Handling

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({ error: "ID is required" })
    }
    
    const service = req.scope.resolve("entity-service")
    const entity = await service.retrieveEntity(id)
    
    res.json({ entity })
  } catch (error) {
    // Handle specific error types
    if (error.message.includes("not found")) {
      res.status(404).json({ error: "Entity not found" })
    } else if (error.name === "ValidationError") {
      res.status(400).json({ error: error.message })
    } else {
      // Log error for debugging
      console.error("Error in GET /entities/[id]:", error)
      
      // Return generic error to client
      res.status(500).json({ 
        error: "Failed to fetch entity",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      })
    }
  }
}
```

## Authentication & Authorization

### Admin Authentication

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }
    
    // Check user permissions
    if (!req.user.role || req.user.role !== "admin") {
      return res.status(403).json({ error: "Insufficient permissions" })
    }
    
    // Process request
    const service = req.scope.resolve("entity-service")
    const entities = await service.listEntities()
    
    res.json({ entities })
  } catch (error) {
    // Handle errors
  }
}
```

### Store Authentication

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Check if customer is authenticated (optional for store routes)
    const customer = req.user
    
    const service = req.scope.resolve("entity-service")
    
    // Filter data based on customer if needed
    const where: any = { status: "active" }
    if (customer) {
      where.customer_id = customer.id
    }
    
    const entities = await service.listEntities({ where })
    
    res.json({ entities })
  } catch (error) {
    // Handle errors
  }
}
```

## Service Integration

### Using Module Services

```typescript
import { SUPPLIER_MODULE } from "../../../modules/supplier"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Resolve module service
    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const suppliers = await supplierService.getActiveSuppliers()
    
    res.json({ suppliers })
  } catch (error) {
    // Handle errors
  }
}
```

### Using Core Services

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Resolve core services
    const productService = req.scope.resolve("productService")
    const customerService = req.scope.resolve("customerService")
    
    const products = await productService.list()
    const customers = await customerService.list()
    
    res.json({ products, customers })
  } catch (error) {
    // Handle errors
  }
}
```

### Using Workflows

```typescript
import { createEntityWorkflow } from "../../../workflows/create-entity"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { result } = await createEntityWorkflow(req.scope)
      .run({
        input: req.body,
      })
    
    res.status(201).json({ result })
  } catch (error) {
    // Handle errors
  }
}
```

## Testing API Routes

### Unit Testing

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { GET, POST } from "./route"

describe("Entity API Routes", () => {
  let mockReq: any
  let mockRes: any
  
  beforeEach(() => {
    mockReq = {
      scope: {
        resolve: jest.fn(),
      },
      query: {},
      params: {},
      body: {},
    }
    
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
  })
  
  it("should get entities", async () => {
    const mockService = {
      listEntities: jest.fn().mockResolvedValue([{ id: "1", name: "test" }]),
    }
    
    mockReq.scope.resolve.mockReturnValue(mockService)
    
    await GET(mockReq, mockRes)
    
    expect(mockRes.json).toHaveBeenCalledWith({
      entities: [{ id: "1", name: "test" }],
    })
  })
  
  it("should create entity", async () => {
    const mockService = {
      createEntities: jest.fn().mockResolvedValue({ id: "1", name: "test" }),
    }
    
    mockReq.scope.resolve.mockReturnValue(mockService)
    mockReq.body = { name: "test" }
    
    await POST(mockReq, mockRes)
    
    expect(mockRes.status).toHaveBeenCalledWith(201)
    expect(mockRes.json).toHaveBeenCalledWith({
      entity: { id: "1", name: "test" },
    })
  })
})
```

### Integration Testing

```typescript
import { describe, it, expect } from "vitest"
import { createMedusaContainer } from "@medusajs/framework/test-utils"

describe("Entity API Integration", () => {
  it("should create and retrieve entity", async () => {
    const container = await createMedusaContainer()
    const service = container.resolve("entity-service")
    
    // Create entity
    const entity = await service.createEntities({ name: "test" })
    expect(entity.name).toBe("test")
    
    // Retrieve entity
    const retrieved = await service.retrieveEntity(entity.id)
    expect(retrieved.id).toBe(entity.id)
  })
})
```

## Best Practices

### 1. Route Design

- **RESTful Conventions**: Follow REST principles
- **Consistent Naming**: Use consistent naming conventions
- **Proper HTTP Methods**: Use appropriate HTTP methods
- **Clear Endpoints**: Make endpoints self-documenting

### 2. Error Handling

- **Graceful Degradation**: Handle errors without breaking
- **Meaningful Messages**: Provide clear error messages
- **Proper Status Codes**: Use appropriate HTTP status codes
- **Logging**: Log errors for debugging

### 3. Validation

- **Input Validation**: Validate all inputs
- **Type Safety**: Use TypeScript for type safety
- **Schema Validation**: Use Zod for runtime validation
- **Custom Validation**: Add business logic validation

### 4. Performance

- **Pagination**: Implement pagination for large datasets
- **Caching**: Cache frequently accessed data
- **Optimization**: Optimize database queries
- **Async Operations**: Use async/await properly

### 5. Security

- **Authentication**: Implement proper authentication
- **Authorization**: Check user permissions
- **Input Sanitization**: Sanitize user inputs
- **Rate Limiting**: Implement rate limiting

## Examples

### Complete CRUD API

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SUPPLIER_MODULE } from "../../../modules/supplier"

const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
})

const updateSupplierSchema = createSupplierSchema.partial()

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { limit = 10, offset = 0, status } = req.query
    
    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    const where: any = {}
    if (status) where.status = status
    
    const suppliers = await supplierService.listSuppliers({
      where,
      take: Number(limit),
      skip: Number(offset),
    })
    
    res.json({ suppliers })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    res.status(500).json({ 
      error: "Failed to fetch suppliers",
      details: error.message 
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = createSupplierSchema.parse(req.body)
    
    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    const supplier = await supplierService.createSuppliers(data)
    
    res.status(201).json({ supplier })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Error creating supplier:", error)
      res.status(500).json({ 
        error: "Failed to create supplier",
        details: error.message 
      })
    }
  }
}
```

### Custom Action Route

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUPPLIER_MODULE } from "../../../modules/supplier"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const { action } = req.body
    
    const supplierService = req.scope.resolve(SUPPLIER_MODULE)
    
    switch (action) {
      case "activate":
        const activated = await supplierService.updateSupplierStatus(id, "active")
        res.json({ supplier: activated })
        break
        
      case "deactivate":
        const deactivated = await supplierService.updateSupplierStatus(id, "inactive")
        res.json({ supplier: deactivated })
        break
        
      case "get_analytics":
        const analytics = await supplierService.getSupplierAnalytics(id)
        res.json({ analytics })
        break
        
      default:
        res.status(400).json({ error: "Invalid action" })
    }
  } catch (error) {
    console.error("Error in custom action:", error)
    res.status(500).json({ 
      error: "Failed to perform action",
      details: error.message 
    })
  }
}
```

## Resources

- [Medusa API Routes Documentation](https://docs.medusajs.com/learn/fundamentals/api-routes)
- [HTTP Framework Reference](https://docs.medusajs.com/reference/http)
- [Service Factory Reference](https://docs.medusajs.com/resources/service-factory-reference)
- [Module Integration](https://docs.medusajs.com/learn/fundamentals/modules)
