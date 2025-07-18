import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

type UpdateBrandInput = {
  id: string
  name?: string
  description?: string
  logo_url?: string
  website_url?: string
}

// Validate update input
const validateUpdateInputStep = createStep(
  "validate-update-input",
  async (input: UpdateBrandInput) => {
    if (!input.id) {
      throw new Error("Brand ID is required")
    }

    if (input.name && input.name.trim().length === 0) {
      throw new Error("Brand name cannot be empty")
    }

    if (input.name && input.name.length > 100) {
      throw new Error("Brand name must be less than 100 characters")
    }

    if (input.description && input.description.length > 500) {
      throw new Error("Brand description must be less than 500 characters")
    }

    return new StepResponse(input)
  }
)

// Check if brand exists
const checkBrandExistsStep = createStep(
  "check-brand-exists",
  async (input: UpdateBrandInput, context) => {
    const brandModuleService: BrandModuleService = context.container.resolve(
      BRAND_MODULE
    )

    try {
      await brandModuleService.getBrandById(input.id)
    } catch (error) {
      throw new Error(`Brand with ID "${input.id}" not found`)
    }

    return new StepResponse(input)
  }
)

// Update brand
const updateBrandStep = createStep(
  "update-brand",
  async (input: UpdateBrandInput, context) => {
    const brandModuleService: BrandModuleService = context.container.resolve(
      BRAND_MODULE
    )

    const { id, ...updateData } = input
    const brand = await brandModuleService.updateBrandById(id, updateData)

    return new StepResponse(brand)
  }
)

const updateBrandWorkflow = createWorkflow(
  "update-brand",
  (input: UpdateBrandInput) => {
    // Step 1: Validate input
    const validatedInput = validateUpdateInputStep(input)

    // Step 2: Check if brand exists
    const checkedInput = checkBrandExistsStep(validatedInput)

    // Step 3: Update brand
    const brand = updateBrandStep(checkedInput)

    return new WorkflowResponse({
      brand,
    })
  }
)

export default updateBrandWorkflow 