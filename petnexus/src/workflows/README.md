# Custom Workflows

A workflow is a series of queries and actions that complete a task.

The workflow is created in a TypeScript or JavaScript file under the `src/workflows` directory.

> Learn more about workflows in [this documentation](https://docs.medusajs.com/learn/fundamentals/workflows).

## Brand Workflows

### create-brand-simple.ts
A simple workflow for creating brands with basic validation.

**Input:**
```typescript
{
  name: string
  description?: string
  logo_url?: string
  website_url?: string
}
```

**Steps:**
1. Validate brand input (name required, length limits)
2. Create brand using Brand module service

**Usage:**
```typescript
import createBrandSimpleWorkflow from "../../../workflows/create-brand-simple"

const { result } = await createBrandSimpleWorkflow(req.scope).run({
  input: {
    name: "Brand Name",
    description: "Brand description",
    logo_url: "https://example.com/logo.png",
    website_url: "https://example.com"
  },
})
```

### create-brand.ts
A basic workflow for creating brands (alternative implementation).

### update-brand.ts
A workflow for updating brands with validation and existence checks.

**Input:**
```typescript
{
  id: string
  name?: string
  description?: string
  logo_url?: string
  website_url?: string
}
```

**Steps:**
1. Validate update input (ID required, length limits)
2. Check if brand exists
3. Update brand using Brand module service

**Usage:**
```typescript
import updateBrandWorkflow from "../../../workflows/update-brand"

const { result } = await updateBrandWorkflow(req.scope).run({
  input: {
    id: "brand_123",
    name: "Updated Brand Name",
    description: "Updated description"
  },
})
```

## Basic Workflow Example

For example:

```ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep("step-1", async () => {
  return new StepResponse(`Hello from step one!`)
})

type WorkflowInput = {
  name: string
}

const step2 = createStep(
  "step-2",
  async ({ name }: WorkflowInput) => {
    return new StepResponse(`Hello ${name} from step two!`)
  }
)

type WorkflowOutput = {
  message1: string
  message2: string
}

const helloWorldWorkflow = createWorkflow(
  "hello-world",
  (input: WorkflowInput) => {
    const greeting1 = step1()
    const greeting2 = step2(input)
    
    return new WorkflowResponse({
      message1: greeting1,
      message2: greeting2
    })
  }
)

export default helloWorldWorkflow
```

## Execute Workflow

You can execute the workflow from other resources, such as API routes, scheduled jobs, or subscribers.

For example, to execute the workflow in an API route:

```ts
import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import myWorkflow from "../../../workflows/hello-world"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await myWorkflow(req.scope)
    .run({
      input: {
        name: req.query.name as string,
      },
    })

  res.send(result)
}
```

## Workflow Features

- **Step-by-step execution**: Each step is executed in sequence
- **Error handling**: Automatic rollback on failure
- **Validation**: Built-in input validation
- **Compensation**: Automatic cleanup on failure
- **Retry logic**: Configurable retry mechanisms
- **Timeout handling**: Configurable timeouts for long-running operations
