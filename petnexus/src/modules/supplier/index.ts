import SupplierModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

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
}

export default supplierModule 