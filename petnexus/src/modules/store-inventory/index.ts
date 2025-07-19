import StoreInventoryService from "./service"
import { Module } from "@medusajs/framework/utils"
import { StoreInventory, InventoryMovement } from "./models"

export const STORE_INVENTORY_MODULE = "store_inventory"

const storeInventoryModule = Module("store_inventory", {
  service: StoreInventoryService,
})

// Export linkable for module links
export const linkable = {
  store_inventory: {
    service: StoreInventoryService,
  },
  inventory_movement: {
    service: StoreInventoryService,
  },
}

export default storeInventoryModule 