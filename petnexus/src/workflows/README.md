# Medusa Workflows Guide

## Overview

Workflows in Medusa are special functions that perform tasks in a series of steps with rollback logic. They ensure data consistency across systems and provide compensation mechanisms for error handling.

## Table of Contents

1. [Workflow Basics](#workflow-basics)
2. [Creating Workflows](#creating-workflows)
3. [Steps and Compensation](#steps-and-compensation)
4. [Workflow Integration](#workflow-integration)
5. [Error Handling](#error-handling)
6. [Testing Workflows](#testing-workflows)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

## Workflow Basics

### What are Workflows?

Workflows are functions that:
- Execute a series of steps in sequence
- Provide rollback logic for each step
- Ensure data consistency across systems
- Handle complex business operations

### Key Concepts

- **Step**: A single unit of work in a workflow
- **Compensation**: Rollback logic for a step
- **Container**: Dependency injection container
- **Response**: Data passed between steps

## Creating Workflows

### Basic Workflow Structure

```typescript
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse 
} from "@medusajs/framework/workflows-sdk"

// Define input type
type WorkflowInput = {
  name: string
  data: any
}

// Create a step
const myStep = createStep(
  "my-step",
  async (input: WorkflowInput, { container }) => {
    // Step logic here
    const result = await doSomething(input)
    return new StepResponse(result, result)
  },
  async (result, { container }) => {
    // Compensation logic here
    await undoSomething(result)
  }
)

// Create the workflow
export const myWorkflow = createWorkflow(
  "my-workflow",
  (input: WorkflowInput) => {
    const result = myStep(input)
    return new WorkflowResponse(result)
  }
)
```

### Step Definition

```typescript
const myStep = createStep(
  "step-name",                    // Step identifier
  async (input, { container }) => {
    // Main step logic
    const service = container.resolve("service-name")
    const result = await service.doSomething(input)
    return new StepResponse(result, result)
  },
  async (result, { container }) => {
    // Compensation logic (optional)
    const service = container.resolve("service-name")
    await service.undoSomething(result)
  }
)
```

### Workflow Definition

```typescript
export const myWorkflow = createWorkflow(
  "workflow-name",           // Workflow identifier
  (input: WorkflowInput) => {
    // Define step sequence
    const step1Result = step1(input)
    const step2Result = step2(step1Result)
    const step3Result = step3(step2Result)
    
    return new WorkflowResponse(step3Result)
  }
)
```

## Steps and Compensation

### Simple Step

```typescript
const createEntityStep = createStep(
  "create-entity",
  async (input, { container }) => {
    const service = container.resolve("entity-service")
    const entity = await service.createEntities(input)
    return new StepResponse(entity, entity)
  }
)
```

### Step with Compensation

```typescript
const createEntityStep = createStep(
  "create-entity",
  async (input, { container }) => {
    const service = container.resolve("entity-service")
    const entity = await service.createEntities(input)
    return new StepResponse(entity, entity)
  },
  async (entity, { container }) => {
    // Compensation: delete the created entity
    const service = container.resolve("entity-service")
    await service.deleteEntities(entity.id)
  }
)
```

### Multi-Step Workflow

```typescript
const createEntityStep = createStep(
  "create-entity",
  async (input, { container }) => {
    const service = container.resolve("entity-service")
    const entity = await service.createEntities(input)
    return new StepResponse(entity, entity)
  },
  async (entity, { container }) => {
    const service = container.resolve("entity-service")
    await service.deleteEntities(entity.id)
  }
)

const updateRelatedStep = createStep(
  "update-related",
  async (entity, { container }) => {
    const service = container.resolve("related-service")
    const updated = await service.updateRelated(entity.id)
    return new StepResponse(updated, updated)
  },
  async (updated, { container }) => {
    const service = container.resolve("related-service")
    await service.revertUpdate(updated.id)
  }
)

export const createEntityWorkflow = createWorkflow(
  "create-entity",
  (input) => {
    const entity = createEntityStep(input)
    const updated = updateRelatedStep(entity)
    return new WorkflowResponse(updated)
  }
)
```

## Workflow Integration

### Using Workflows in API Routes

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createEntityWorkflow } from "../../../workflows/create-entity"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { result } = await createEntityWorkflow(req.scope)
      .run({
        input: req.body,
      })
    
    res.status(201).json({ result })
  } catch (error) {
    res.status(500).json({ 
      error: "Workflow failed",
      details: error.message 
    })
  }
}
```

### Using Workflows in Services

```typescript
import { createEntityWorkflow } from "../../workflows/create-entity"

class MyService {
  async createEntityWithWorkflow(data: any) {
    const { result } = await createEntityWorkflow(this.container)
      .run({
        input: data,
      })
    
    return result
  }
}
```

### Using Workflows in Other Workflows

```typescript
const subWorkflowStep = createStep(
  "sub-workflow",
  async (input, { container }) => {
    const { result } = await createEntityWorkflow(container)
      .run({
        input,
      })
    return new StepResponse(result, result)
  }
)

export const mainWorkflow = createWorkflow(
  "main-workflow",
  (input) => {
    const result = subWorkflowStep(input)
    return new WorkflowResponse(result)
  }
)
```

## Error Handling

### Workflow Error Handling

```typescript
export const createEntityWorkflow = createWorkflow(
  "create-entity",
  (input) => {
    try {
      const entity = createEntityStep(input)
      return new WorkflowResponse(entity)
    } catch (error) {
      // Handle workflow-level errors
      console.error("Workflow error:", error)
      throw error
    }
  }
)
```

### Step Error Handling

```typescript
const createEntityStep = createStep(
  "create-entity",
  async (input, { container }) => {
    try {
      const service = container.resolve("entity-service")
      const entity = await service.createEntities(input)
      return new StepResponse(entity, entity)
    } catch (error) {
      console.error("Step error:", error)
      throw error
    }
  },
  async (entity, { container }) => {
    try {
      const service = container.resolve("entity-service")
      await service.deleteEntities(entity.id)
    } catch (compensationError) {
      console.error("Compensation error:", compensationError)
      // Log but don't throw - compensation errors shouldn't break the workflow
    }
  }
)
```

### API Route Error Handling

```typescript
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { result } = await createEntityWorkflow(req.scope)
      .run({
        input: req.body,
      })
    
    res.status(201).json({ result })
  } catch (error) {
    console.error("API error:", error)
    
    if (error.name === "ValidationError") {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ 
        error: "Internal server error",
        details: error.message 
      })
    }
  }
}
```

## Testing Workflows

### Unit Testing

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { createEntityWorkflow } from "../workflows/create-entity"

describe("createEntityWorkflow", () => {
  it("should create entity successfully", async () => {
    const mockContainer = {
      resolve: jest.fn().mockReturnValue({
        createEntities: jest.fn().mockResolvedValue({ id: "1", name: "test" }),
        deleteEntities: jest.fn().mockResolvedValue(undefined),
      }),
    }
    
    const { result } = await createEntityWorkflow(mockContainer)
      .run({
        input: { name: "test" },
      })
    
    expect(result.name).toBe("test")
  })
})
```

### Integration Testing

```typescript
import { describe, it, expect } from "vitest"
import { createMedusaContainer } from "@medusajs/framework/test-utils"
import { createEntityWorkflow } from "../workflows/create-entity"

describe("createEntityWorkflow Integration", () => {
  it("should create entity with real services", async () => {
    const container = await createMedusaContainer()
    
    const { result } = await createEntityWorkflow(container)
      .run({
        input: { name: "test" },
      })
    
    expect(result.name).toBe("test")
  })
})
```

## Best Practices

### 1. Workflow Design

- **Single Responsibility**: Each workflow should have one clear purpose
- **Idempotency**: Workflows should be safe to retry
- **Compensation**: Always provide compensation logic for destructive operations
- **Error Handling**: Handle errors at appropriate levels

### 2. Step Design

- **Atomic Operations**: Each step should be atomic
- **Clear Input/Output**: Define clear interfaces for step data
- **Compensation Logic**: Provide rollback for each step
- **Service Resolution**: Use container.resolve() for dependencies

### 3. Error Handling

- **Graceful Degradation**: Handle errors without breaking the entire workflow
- **Logging**: Log errors for debugging
- **Compensation**: Ensure compensation logic handles its own errors
- **User Feedback**: Provide meaningful error messages

### 4. Performance

- **Async Operations**: Use async/await for all operations
- **Batch Operations**: Group related operations when possible
- **Caching**: Cache frequently accessed data
- **Optimization**: Optimize database queries

## Examples

### Complete Workflow Example

```typescript
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse 
} from "@medusajs/framework/workflows-sdk"
import { SUPPLIER_MODULE } from "../modules/supplier"
import SupplierService from "../modules/supplier/service"

type CreateRestockOrderInput = {
  supplier_id: string
  items: Array<{
    product_id: string
    quantity: number
    unit_cost: number
  }>
  notes?: string
}

// Step 1: Create restock order
const createOrderStep = createStep(
  "create-order",
  async (input: CreateRestockOrderInput, { container }) => {
    const supplierService: SupplierService = container.resolve(SUPPLIER_MODULE)
    
    const order = await supplierService.createRestockOrder({
      supplier_id: input.supplier_id,
      total_items: input.items.length,
      total_cost: input.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0),
      notes: input.notes,
    })
    
    return new StepResponse(order, order)
  },
  async (order, { container }) => {
    const supplierService: SupplierService = container.resolve(SUPPLIER_MODULE)
    await supplierService.deleteRestockOrders(order.id)
  }
)

// Step 2: Create order items
const createItemsStep = createStep(
  "create-items",
  async (order, { container }) => {
    const supplierService: SupplierService = container.resolve(SUPPLIER_MODULE)
    
    const items = []
    for (const itemData of order.items) {
      const item = await supplierService.createRestockOrderItem({
        restock_order_id: order.id,
        product_id: itemData.product_id,
        quantity: itemData.quantity,
        unit_cost: itemData.unit_cost,
      })
      items.push(item)
    }
    
    return new StepResponse(items, items)
  },
  async (items, { container }) => {
    const supplierService: SupplierService = container.resolve(SUPPLIER_MODULE)
    for (const item of items) {
      await supplierService.deleteRestockOrderItems(item.id)
    }
  }
)

// Step 3: Update order status
const updateStatusStep = createStep(
  "update-status",
  async (items, { container }) => {
    const supplierService: SupplierService = container.resolve(SUPPLIER_MODULE)
    
    const order = await supplierService.updateRestockOrderStatus(
      items[0].restock_order_id,
      "confirmed"
    )
    
    return new StepResponse(order, order)
  },
  async (order, { container }) => {
    const supplierService: SupplierService = container.resolve(SUPPLIER_MODULE)
    await supplierService.updateRestockOrderStatus(
      order.id,
      "pending"
    )
  }
)

// Complete workflow
export const createRestockOrderWorkflow = createWorkflow(
  "create-restock-order",
  (input: CreateRestockOrderInput) => {
    const order = createOrderStep(input)
    const items = createItemsStep(order)
    const finalOrder = updateStatusStep(items)
    
    return new WorkflowResponse(finalOrder)
  }
)
```

### API Route Using Workflow

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { createRestockOrderWorkflow } from "../../../workflows/create-restock-order"

const createRestockOrderSchema = z.object({
  supplier_id: z.string(),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().min(1),
    unit_cost: z.number().min(0),
  })),
  notes: z.string().optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = createRestockOrderSchema.parse(req.body)
    
    const { result: order } = await createRestockOrderWorkflow(req.scope)
      .run({
        input: data,
      })
    
    res.status(201).json({ order })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      console.error("Workflow error:", error)
      res.status(500).json({ 
        error: "Failed to create restock order",
        details: error.message 
      })
    }
  }
}
```

## Resources

- [Medusa Workflows Documentation](https://docs.medusajs.com/learn/fundamentals/workflows)
- [Workflows SDK Reference](https://docs.medusajs.com/reference/workflows-sdk)
- [Service Factory Reference](https://docs.medusajs.com/resources/service-factory-reference)
- [Module Integration](https://docs.medusajs.com/learn/fundamentals/modules)
