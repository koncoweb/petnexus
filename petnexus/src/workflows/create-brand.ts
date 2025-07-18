import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

type CreateBrandInput = {
  name: string
  description?: string
  logo_url?: string
  website_url?: string
}

type CreateBrandOutput = {
  brand: {
    id: string
    name: string
    description?: string
    logo_url?: string
    website_url?: string
  }
}

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

const createBrandWorkflow = createWorkflow(
  "create-brand",
  (input: CreateBrandInput) => {
    const brand = createBrandStep(input)

    return new WorkflowResponse({
      brand,
    })
  }
)

export default createBrandWorkflow 