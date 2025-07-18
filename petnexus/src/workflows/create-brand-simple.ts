import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

type CreateBrandInput = {
  name: string
  description?: string
  logo_url?: string
  website_url?: string
}

// Simple validation step
const validateBrandInputStep = createStep(
  "validate-brand-input",
  async (input: CreateBrandInput) => {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Brand name is required")
    }

    if (input.name.length > 100) {
      throw new Error("Brand name must be less than 100 characters")
    }

    return new StepResponse(input)
  }
)

// Create brand step
const createBrandStep = createStep(
  "create-brand",
  async (input: CreateBrandInput, context) => {
    const brandModuleService: BrandModuleService = context.container.resolve(
      BRAND_MODULE
    )

    const brand = await brandModuleService.createNewBrand(input)

    return new StepResponse(brand)
  }
)

const createBrandSimpleWorkflow = createWorkflow(
  "create-brand-simple",
  (input: CreateBrandInput) => {
    // Step 1: Validate input
    const validatedInput = validateBrandInputStep(input)

    // Step 2: Create brand
    const brand = createBrandStep(validatedInput)

    return new WorkflowResponse({
      brand,
    })
  }
)

export default createBrandSimpleWorkflow 