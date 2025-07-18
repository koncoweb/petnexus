import { MedusaService } from "@medusajs/framework/utils"
import Supplier from "./models/supplier"
import RestockOrder from "./models/restock-order"
import RestockOrderItem from "./models/restock-order-item"

class SupplierModuleService extends MedusaService({
  Supplier,
  RestockOrder,
  RestockOrderItem,
}) {
  // Supplier management methods
  async getSupplierWithDetails(supplierId: string) {
    const supplier = await this.retrieveSupplier(supplierId)
    return supplier
  }

  async getActiveSuppliers() {
    return await this.listSuppliers({
      where: { status: "active" },
    })
  }

  async updateSupplierStatus(supplierId: string, status: "active" | "inactive" | "suspended") {
    return await this.updateSuppliers({ id: supplierId, status })
  }

  // Restock order management methods
  async createRestockOrder(data: {
    supplier_id: string
    total_items: number
    total_cost: number
    currency_code?: string
    notes?: string
    expected_delivery_date?: string
  }) {
    const orderData = {
      ...data,
      currency_code: data.currency_code || "USD",
    }
    
    return await this.createRestockOrders(orderData)
  }

  async getSupplierRestockOrders(supplierId: string, status?: string) {
    try {
      // Use a simpler approach - get all orders and filter in memory if needed
      const allOrders = await this.listRestockOrders()
      
      // Filter by supplier_id
      let filteredOrders = allOrders.filter(order => order.supplier_id === supplierId)
      
      // Filter by status if provided
      if (status && status !== "all") {
        filteredOrders = filteredOrders.filter(order => order.status === status)
      }
      
      return filteredOrders
    } catch (error) {
      console.error("Error in getSupplierRestockOrders:", error)
      throw new Error(`Failed to fetch restock orders: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateRestockOrderStatus(orderId: string, status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") {
    const updateData: any = { status }
    
    if (status === "delivered") {
      updateData.actual_delivery_date = new Date().toISOString()
    }
    
    return await this.updateRestockOrders({ id: orderId, ...updateData })
  }

  async createRestockOrderItem(data: {
    restock_order_id: string
    product_id: string
    variant_id: string
    quantity: number
    unit_cost: number
    notes?: string
  }) {
    const itemData = {
      ...data,
      total_cost: data.quantity * data.unit_cost,
    }
    
    return await this.createRestockOrderItems(itemData)
  }

  async getRestockOrderItems(orderId: string) {
    return await this.listRestockOrderItems({
      where: { restock_order_id: orderId },
    })
  }

  // Analytics methods
  async getSupplierAnalytics(supplierId: string) {
    const orders = await this.listRestockOrders({
      where: { supplier_id: supplierId },
    })

    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === "pending").length
    const inProgressOrders = orders.filter(o => ["confirmed", "shipped"].includes(o.status)).length
    const completedOrders = orders.filter(o => o.status === "delivered").length
    const totalValue = orders.reduce((sum, order) => sum + (order.total_cost || 0), 0)

    return {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      totalValue,
    }
  }
}

export default SupplierModuleService 