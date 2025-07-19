import SupplierModule from "../modules/supplier"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  SupplierModule.linkable.supplier,
  ProductModule.linkable.product
) 