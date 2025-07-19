import SupplierModuleService from "./service"
import { Module } from "@medusajs/framework/utils"
import Supplier from "./models/supplier"
import RestockOrder from "./models/restock-order"
import RestockOrderItem from "./models/restock-order-item"
import SupplierPromotion from "./models/supplier-promotion"
import BrandPromotion from "./models/brand-promotion"
import ProductPromotion from "./models/product-promotion"

export const SUPPLIER_MODULE = "supplier"

const supplierModule = Module(SUPPLIER_MODULE, {
  service: SupplierModuleService,
})

// Export linkable for module links
export const linkable = {
  supplier: {
    service: SupplierModuleService,
  },
  restock_order: {
    service: SupplierModuleService,
  },
  restock_order_item: {
    service: SupplierModuleService,
  },
  supplier_promotion: {
    service: SupplierModuleService,
  },
  brand_promotion: {
    service: SupplierModuleService,
  },
  product_promotion: {
    service: SupplierModuleService,
  },
}

export default supplierModule 