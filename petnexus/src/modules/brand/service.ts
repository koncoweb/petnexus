import { MedusaService } from "@medusajs/framework/utils"
import Brand from "./models/brand"

class BrandModuleService extends MedusaService({
  Brand,
}) {
  async listAllBrands() {
    const [brands] = await this.listBrands()
    return brands
  }

  async createNewBrand(data: {
    name: string
    description?: string
    logo_url?: string
    website_url?: string
  }) {
    return await this.createBrands(data)
  }

  async updateBrandById(id: string, data: {
    name?: string
    description?: string
    logo_url?: string
    website_url?: string
  }) {
    return await this.updateBrands({ id }, data)
  }

  async deleteBrandById(id: string) {
    return await this.deleteBrands({ id })
  }

  async getBrandById(id: string) {
    return await this.retrieveBrand(id)
  }
}

export default BrandModuleService 