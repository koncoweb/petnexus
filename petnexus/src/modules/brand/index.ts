import BrandModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const BRAND_MODULE = "brand"

const brandModule = Module(BRAND_MODULE, {
  service: BrandModuleService,
})

// Export linkable for module links
export const linkable = {
  brand: {
    service: BrandModuleService,
  },
}

export default brandModule 