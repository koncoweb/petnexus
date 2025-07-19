import { MedusaService } from "@medusajs/framework/utils"
import { StoreInventory, InventoryMovement } from "./models"

class StoreInventoryService extends MedusaService({
  StoreInventory,
  InventoryMovement,
}) {
  // Custom business logic methods for inventory management
  
  async getInventoryLevels(storeId: string, productIds?: string[]) {
    const where: any = { store_id: storeId }
    
    if (productIds && productIds.length > 0) {
      where.product_id = { $in: productIds }
    }
    
    return await this.listStoreInventories({
      where,
    })
  }

  async updateStock(
    storeId: string,
    productId: string,
    variantId: string,
    quantity: number,
    movementType: string,
    referenceId?: string,
    notes?: string
  ) {
    // Get current inventory
    const currentInventory = await this.listStoreInventories({
      where: {
        store_id: storeId,
        product_id: productId,
        variant_id: variantId,
      },
    })

    let inventory = currentInventory[0]
    const previousStock = inventory?.current_stock || 0

    // Calculate new stock based on movement type
    let newStock = previousStock
    switch (movementType) {
      case "restock":
      case "return":
        newStock += quantity
        break
      case "sale":
        newStock -= quantity
        break
      case "adjustment":
        newStock = quantity // Direct adjustment
        break
      case "transfer":
        // For transfers, we might need to handle differently
        newStock += quantity
        break
      default:
        throw new Error(`Invalid movement type: ${movementType}`)
    }

    // Ensure stock doesn't go negative
    if (newStock < 0) {
      throw new Error(`Insufficient stock for product ${productId}, variant ${variantId}`)
    }

    // Update or create inventory record
    if (inventory) {
      await this.updateStoreInventories(
        { id: inventory.id },
        {
          current_stock: newStock,
          available_stock: newStock - (inventory.reserved_stock || 0),
          last_sale_date: movementType === "sale" ? new Date().toISOString() : inventory.last_sale_date,
          last_restock_date: movementType === "restock" ? new Date().toISOString() : inventory.last_restock_date,
          low_stock_alert: newStock <= (inventory.minimum_stock || 10),
          overstock_alert: newStock >= (inventory.maximum_stock || 1000),
        }
      )
    } else {
      // TODO: Fix createStoreInventories method call - using temporary approach
      // Create new inventory record - simplified for now
      inventory = {
        id: `inv-${Date.now()}`,
        store_id: storeId,
        product_id: productId,
        variant_id: variantId,
        current_stock: newStock,
        available_stock: newStock,
        last_sale_date: movementType === "sale" ? new Date().toISOString() : null,
        last_restock_date: movementType === "restock" ? new Date().toISOString() : null,
        low_stock_alert: newStock <= 10,
        overstock_alert: newStock >= 1000,
      } as any
    }

    // TODO: Fix createInventoryMovements method call - using temporary approach
    // Create movement record - simplified for now
    const movementRecord = {
      id: `mov-${Date.now()}`,
      store_id: storeId,
      product_id: productId,
      variant_id: variantId,
      movement_type: movementType,
      quantity: quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reference_id: referenceId || "",
      reference_type: this.getReferenceType(movementType),
      notes: notes || "",
      user_id: "system",
    } as any

    return inventory
  }

  async calculateStockMetrics(storeId: string) {
    const inventoryLevels = await this.listStoreInventories({
      where: { store_id: storeId },
    })

    const totalItems = inventoryLevels.length
    const lowStockItems = inventoryLevels.filter(inv => inv.low_stock_alert).length
    const overstockItems = inventoryLevels.filter(inv => inv.overstock_alert).length
    const totalStock = inventoryLevels.reduce((sum, inv) => sum + (inv.current_stock || 0), 0)
    const averageStock = totalItems > 0 ? totalStock / totalItems : 0

    return {
      total_items: totalItems,
      low_stock_items: lowStockItems,
      overstock_items: overstockItems,
      total_stock: totalStock,
      average_stock: averageStock,
    }
  }

  async getLowStockItems(storeId: string) {
    return await this.listStoreInventories({
      where: {
        store_id: storeId,
        low_stock_alert: true,
      },
    })
  }

  async getOverstockItems(storeId: string) {
    return await this.listStoreInventories({
      where: {
        store_id: storeId,
        overstock_alert: true,
      },
    })
  }

  async reserveStock(
    storeId: string,
    productId: string,
    variantId: string,
    quantity: number
  ) {
    const inventory = await this.listStoreInventories({
      where: {
        store_id: storeId,
        product_id: productId,
        variant_id: variantId,
      },
    })

    if (!inventory[0]) {
      throw new Error(`Inventory not found for product ${productId}, variant ${variantId}`)
    }

    const currentReserved = inventory[0].reserved_stock || 0
    const newReserved = currentReserved + quantity

    if (newReserved > inventory[0].current_stock) {
      throw new Error(`Cannot reserve more stock than available`)
    }

    await this.updateStoreInventories(
      { id: inventory[0].id },
      {
        reserved_stock: newReserved,
        available_stock: inventory[0].current_stock - newReserved,
      }
    )

    return inventory[0]
  }

  async releaseReservedStock(
    storeId: string,
    productId: string,
    variantId: string,
    quantity: number
  ) {
    const inventory = await this.listStoreInventories({
      where: {
        store_id: storeId,
        product_id: productId,
        variant_id: variantId,
      },
    })

    if (!inventory[0]) {
      throw new Error(`Inventory not found for product ${productId}, variant ${variantId}`)
    }

    const currentReserved = inventory[0].reserved_stock || 0
    const newReserved = Math.max(0, currentReserved - quantity)

    await this.updateStoreInventories(
      { id: inventory[0].id },
      {
        reserved_stock: newReserved,
        available_stock: inventory[0].current_stock - newReserved,
      }
    )

    return inventory[0]
  }

  private getReferenceType(movementType: string): string {
    switch (movementType) {
      case "restock":
        return "restock_order"
      case "sale":
        return "order"
      case "adjustment":
        return "adjustment"
      case "transfer":
        return "transfer"
      case "return":
        return "return"
      default:
        return "other"
    }
  }
}

export default StoreInventoryService 