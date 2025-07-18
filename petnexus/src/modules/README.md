# Medusa Modules Development Guide

## Overview

This guide covers best practices for creating, managing, and integrating custom modules in Medusa applications. It provides step-by-step instructions, code examples, and troubleshooting tips.

## Table of Contents

1. [Module Structure](#module-structure)
2. [Creating a New Module](#creating-a-new-module)
3. [Data Models](#data-models)
4. [Services](#services)
5. [API Routes](#api-routes)
6. [Workflows](#workflows)
7. [Module Integration](#module-integration)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Module Structure

A typical Medusa module follows this structure:

```
src/modules/[module-name]/
├── index.ts              # Module registration and exports
├── service.ts            # Business logic and CRUD operations
├── models/               # Data models
│   ├── entity1.ts        # Primary entity
│   ├── entity2.ts        # Related entities
│   └── index.ts          # Model exports
├── migrations/           # Database migrations
├── api/                  # API routes (optional)
│   ├── admin/
│   └── store/
├── workflows/            # Workflows (optional)
├── tests/                # Tests (optional)
└── README.md            # Module documentation
```

## Creating a New Module

### Step 1: Create Module Directory

```bash
mkdir src/modules/my-module
cd src/modules/my-module
```

### Step 2: Define Data Models

Create `src/modules/my-module/models/entity.ts`:

```typescript
import { model } from "@medusajs/framework/utils"

const Entity = model.define("entity", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text(),
  status: model.enum(["active", "inactive"]).default("active"),
  metadata: model.json(),
})

export default Entity
```

### Step 3: Create Service

Create `src/modules/my-module/service.ts`:

```typescript
import { MedusaService } from "@medusajs/framework/utils"
import Entity from "./models/entity"

class MyModuleService extends MedusaService({
  Entity,
}) {
  // Custom business logic methods
  async getActiveEntities() {
    return await this.listEntities({
      where: { status: "active" },
    })
  }

  async updateEntityStatus(entityId: string, status: "active" | "inactive") {
    return await this.updateEntities({ id: entityId, status })
  }
}

export default MyModuleService
```

### Step 4: Register Module

Create `src/modules/my-module/index.ts`:

```typescript
import MyModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const MY_MODULE = "my-module"

const myModule = Module(MY_MODULE, {
  service: MyModuleService,
})

// Export linkable for module links
export const linkable = {
  entity: {
    service: MyModuleService,
  },
}

export default myModule
```

### Step 5: Add to Configuration

Update `medusa-config.ts`:

```typescript
module.exports = defineConfig({
  // ... other config
  modules: [
    {
      resolve: "./src/modules/my-module",
    },
  ],
})
```

### Step 6: Generate Migrations

```bash
npx medusa db:generate my-module
npx medusa db:migrate
```

## Data Models

### Model Definition

```typescript
import { model } from "@medusajs/framework/utils"

const MyEntity = model.define("my_entity", {
  // Primary key
  id: model.id().primaryKey(),
  
  // Text fields
  name: model.text(),
  description: model.text().optional(),
  
  // Number fields
  price: model.number(),
  quantity: model.number().default(0),
  
  // Enum fields
  status: model.enum(["active", "inactive", "pending"]).default("active"),
  
  // JSON fields
  metadata: model.json(),
  
  // Date fields
  created_at: model.date(),
  updated_at: model.date(),
  
  // Boolean fields
  is_featured: model.boolean().default(false),
})
```

### Relationships

#### One-to-Many

```typescript
// Parent entity
const Parent = model.define("parent", {
  id: model.id().primaryKey(),
  name: model.text(),
})

// Child entity
const Child = model.define("child", {
  id: model.id().primaryKey(),
  parent_id: model.text(), // Foreign key
  name: model.text(),
})
```

#### Many-to-Many

```typescript
// Main entities
const Entity1 = model.define("entity1", {
  id: model.id().primaryKey(),
  name: model.text(),
})

const Entity2 = model.define("entity2", {
  id: model.id().primaryKey(),
  name: model.text(),
})

// Pivot entity
const Entity1Entity2 = model.define("entity1_entity2", {
  id: model.id().primaryKey(),
  entity1_id: model.text(),
  entity2_id: model.text(),
  metadata: model.json(),
})
```

## Services

### Basic Service

```typescript
import { MedusaService } from "@medusajs/framework/utils"
import Entity from "./models/entity"

class MyService extends MedusaService({
  Entity,
}) {
  // Generated methods:
  // - createEntities()
  // - retrieveEntity()
  // - listEntities()
  // - updateEntities()
  // - deleteEntities()
}
```

### Custom Methods

```typescript
class MyService extends MedusaService({
  Entity,
}) {
  // Custom business logic
  async getActiveEntities() {
    return await this.listEntities({
      where: { status: "active" },
    })
  }

  async updateEntityStatus(entityId: string, status: string) {
    return await this.updateEntities({ id: entityId, status })
  }

  async getEntityAnalytics(entityId: string) {
    const entity = await this.retrieveEntity(entityId)
    // Custom analytics logic
    return {
      totalItems: 0,
      activeItems: 0,
      // ... other metrics
    }
  }
}
```

### Error Handling

```typescript
class MyService extends MedusaService({
  Entity,
}) {
  async createEntity(data: any) {
    try {
      return await this.createEntities(data)
    } catch (error) {
      console.error("Error creating entity:", error)
      throw new Error(`Failed to create entity: ${error.message}`)
    }
  }
}
```

## API Routes

### Admin Routes

Create `src/api/admin/my-entities/route.ts`:

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { MY_MODULE } from "../../../modules/my-module"

const createEntitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const service = req.scope.resolve(MY_MODULE)
    const entities = await service.listEntities()
    
    res.json({ entities })
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch entities",
      details: error.message 
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = createEntitySchema.parse(req.body)
    const service = req.scope.resolve(MY_MODULE)
    
    const entity = await service.createEntities(data)
    
    res.status(201).json({ entity })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues })
    } else {
      res.status(500).json({ 
        error: "Failed to create entity",
        details: error.message 
      })
    }
  }
}
```

### Store Routes

Create `src/api/store/my-entities/route.ts`:

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MY_MODULE } from "../../../modules/my-module"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const service = req.scope.resolve(MY_MODULE)
    const entities = await service.getActiveEntities()
    
    res.json({ entities })
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch entities",
      details: error.message 
    })
  }
}
```

## Workflows

### Creating Workflows

Create `src/workflows/create-entity.ts`:

```typescript
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse 
} from "@medusajs/framework/workflows-sdk"
import { MY_MODULE } from "../modules/my-module"
import MyService from "../modules/my-module/service"

type CreateEntityInput = {
  name: string
  description?: string
}

const createEntityStep = createStep(
  "create-entity",
  async (input: CreateEntityInput, { container }) => {
    const service: MyService = container.resolve(MY_MODULE)
    
    const entity = await service.createEntities(input)
    
    return new StepResponse(entity, entity)
  },
  async (entity, { container }) => {
    const service: MyService = container.resolve(MY_MODULE)
    await service.deleteEntities(entity.id)
  }
)

export const createEntityWorkflow = createWorkflow(
  "create-entity",
  (input: CreateEntityInput) => {
    const entity = createEntityStep(input)
    return new WorkflowResponse(entity)
  }
)
```

### Using Workflows in API Routes

```typescript
import { createEntityWorkflow } from "../../../workflows/create-entity"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { result: entity } = await createEntityWorkflow(req.scope)
      .run({
        input: req.body,
      })
    
    res.status(201).json({ entity })
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to create entity",
      details: error.message 
    })
  }
}
```

## Module Integration

### Service Resolution

```typescript
// In API routes
const service = req.scope.resolve(MY_MODULE)

// In workflows
const service = container.resolve(MY_MODULE)

// In other services
const service = this.container.resolve(MY_MODULE)
```

### Cross-Module Relationships

```typescript
// In module index.ts
export const linkable = {
  entity: {
    service: MyService,
  },
  related_entity: {
    service: MyService,
  },
}
```

### Linking with Core Modules

```typescript
// Link with Product module
export const linkable = {
  entity: {
    service: MyService,
  },
  product: {
    service: ProductService,
  },
}
```

## Testing

### Unit Tests

Create `src/modules/my-module/tests/service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import MyService from "../service"

describe("MyService", () => {
  let service: MyService

  beforeEach(() => {
    service = new MyService()
  })

  it("should create entity", async () => {
    const data = { name: "Test Entity" }
    const entity = await service.createEntities(data)
    
    expect(entity.name).toBe("Test Entity")
  })

  it("should get active entities", async () => {
    const entities = await service.getActiveEntities()
    expect(entities).toBeDefined()
  })
})
```

### Integration Tests

Create `src/modules/my-module/tests/api.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { createMedusaContainer } from "@medusajs/framework/test-utils"

describe("My Module API", () => {
  it("should create entity via API", async () => {
    const container = await createMedusaContainer()
    const service = container.resolve(MY_MODULE)
    
    const entity = await service.createEntities({
      name: "Test Entity",
    })
    
    expect(entity.name).toBe("Test Entity")
  })
})
```

## Deployment

### Pre-deployment Checklist

1. **Migrations**: Ensure all migrations are applied
2. **Configuration**: Verify module registration in medusa-config.ts
3. **Testing**: Run all tests
4. **Documentation**: Update README files
5. **Environment**: Check environment variables

### Deployment Commands

```bash
# Generate migrations
npx medusa db:generate my-module

# Apply migrations
npx medusa db:migrate

# Run tests
npm test

# Build application
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues

#### 1. Service Resolution Errors

**Error**: `Cannot resolve service 'my-module'`

**Solution**:
- Verify module is registered in medusa-config.ts
- Check module constant usage
- Ensure proper import paths

#### 2. Database Errors

**Error**: `Table 'my_entity' doesn't exist`

**Solution**:
- Run migrations: `npx medusa db:migrate`
- Check model definitions
- Verify foreign key relationships

#### 3. API Errors

**Error**: `500 Internal Server Error`

**Solution**:
- Check request validation
- Verify authentication/authorization
- Review error logs

#### 4. Workflow Errors

**Error**: `Workflow step failed`

**Solution**:
- Check step compensation logic
- Verify service resolution in workflow
- Review input validation

### Debug Steps

1. **Check Logs**: Review server logs for detailed error messages
2. **Verify Schema**: Ensure database schema matches model definitions
3. **Test Services**: Test service methods directly
4. **Validate API**: Check API request/response formats
5. **Check Dependencies**: Verify all required dependencies are installed

### Performance Optimization

1. **Database Queries**: Use proper indexing
2. **Caching**: Implement caching for frequently accessed data
3. **Pagination**: Use pagination for large datasets
4. **Lazy Loading**: Load related data on demand

## Best Practices

### 1. Module Design
- Keep modules focused and single-purpose
- Use clear naming conventions
- Implement proper error handling
- Follow TypeScript best practices

### 2. Data Models
- Use snake_case for table names
- Include proper relationships
- Use enums for status fields
- Set appropriate defaults

### 3. Services
- Extend MedusaService for CRUD operations
- Add custom business logic methods
- Implement proper error handling
- Use dependency injection

### 4. API Design
- Follow RESTful conventions
- Implement proper validation
- Return consistent response formats
- Handle errors gracefully

### 5. Testing
- Write unit tests for services
- Write integration tests for APIs
- Test error scenarios
- Use proper test data

## Resources

- [Medusa Documentation](https://docs.medusajs.com/)
- [Modules Guide](https://docs.medusajs.com/learn/fundamentals/modules)
- [Data Models](https://docs.medusajs.com/learn/fundamentals/data-models)
- [Workflows](https://docs.medusajs.com/learn/fundamentals/workflows)
- [API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes)
- [Service Factory Reference](https://docs.medusajs.com/resources/service-factory-reference)
