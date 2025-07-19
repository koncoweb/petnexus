import SupplierModule from "../modules/supplier"
import BrandModule from "../modules/brand"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  SupplierModule.linkable.supplier,
  BrandModule.linkable.brand
) 