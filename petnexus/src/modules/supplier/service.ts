import { MedusaService } from "@medusajs/framework/utils"
import Supplier from "./models/supplier"
import RestockOrder from "./models/restock-order"
import RestockOrderItem from "./models/restock-order-item"
import SupplierPromotion from "./models/supplier-promotion"
import BrandPromotion from "./models/brand-promotion"
import ProductPromotion from "./models/product-promotion"

class SupplierModuleService extends MedusaService({
  Supplier,
  RestockOrder,
  RestockOrderItem,
  SupplierPromotion,
  BrandPromotion,
  ProductPromotion,
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

  async getRestockOrderById(orderId: string) {
    return await this.retrieveRestockOrder(orderId)
  }

  async removeRestockOrder(orderId: string) {
    return await this.deleteRestockOrders(orderId)
  }

  async removeRestockOrderItem(itemId: string) {
    return await this.deleteRestockOrderItems(itemId)
  }

  async updateRestockOrderItem(itemId: string, data: {
    quantity?: number
    unit_cost?: number
    notes?: string
  }) {
    const updateData: any = { ...data }
    
    // Recalculate total_cost if quantity or unit_cost changes
    if (data.quantity || data.unit_cost) {
      const currentItem = await this.retrieveRestockOrderItem(itemId)
      const newQuantity = data.quantity || currentItem.quantity
      const newUnitCost = data.unit_cost || currentItem.unit_cost
      updateData.total_cost = newQuantity * newUnitCost
    }
    
    return await this.updateRestockOrderItem(itemId, updateData)
  }

  async getRestockOrderAnalytics() {
    const allOrders = await this.listRestockOrders()
    
    const totalOrders = allOrders.length
    const pendingOrders = allOrders.filter(o => o.status === "pending").length
    const confirmedOrders = allOrders.filter(o => o.status === "confirmed").length
    const shippedOrders = allOrders.filter(o => o.status === "shipped").length
    const deliveredOrders = allOrders.filter(o => o.status === "delivered").length
    const cancelledOrders = allOrders.filter(o => o.status === "cancelled").length
    
    const totalValue = allOrders.reduce((sum, order) => sum + (order.total_cost || 0), 0)
    const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0
    
    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalValue,
      averageOrderValue,
    }
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

  // ===== PROMOTION MANAGEMENT =====
  
  // Create supplier promotion
  async createSupplierPromotion(data: {
    supplier_id: string
    name: string
    description: string
    promotion_type: "brand" | "product" | "category"
    discount_type: "percentage" | "fixed_amount" | "buy_x_get_y" | "free_shipping"
    discount_value: number
    minimum_quantity?: number
    maximum_quantity?: number
    buy_quantity?: number
    get_quantity?: number
    start_date: string
    end_date: string
    max_usage?: number
    terms_conditions?: string
  }) {
    const promotionData = {
      ...data,
      minimum_quantity: data.minimum_quantity || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return await this.createSupplierPromotions(promotionData)
  }

  // Get active promotions for supplier
  async getSupplierActivePromotions(supplierId: string) {
    const promotions = await this.listSupplierPromotions({
      where: { 
        supplier_id: supplierId,
        status: "active"
      },
    })
    return promotions
  }

  // Create brand promotion
  async createBrandPromotion(data: {
    supplier_promotion_id: string
    brand_id: string
    brand_discount_override?: number
  }) {
    const brandPromotionData = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return await this.createBrandPromotions(brandPromotionData)
  }

  // Create product promotion
  async createProductPromotion(data: {
    supplier_promotion_id: string
    product_id: string
    variant_id?: string
    product_discount_override?: number
    product_minimum_quantity?: number
  }) {
    const productPromotionData = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return await this.createProductPromotions(productPromotionData)
  }

  // Get promotions for specific brand
  async getBrandPromotions(brandId: string) {
    const brandPromotions = await this.listBrandPromotions({
      where: { 
        brand_id: brandId,
        is_active: true
      },
    })
    
    // Get supplier promotion details for each brand promotion
    const promotionsWithDetails = await Promise.all(
      brandPromotions.map(async (bp) => {
        const supplierPromotion = await this.retrieveSupplierPromotion(bp.supplier_promotion_id)
        return {
          ...bp,
          supplier_promotion: supplierPromotion,
        }
      })
    )
    
    return promotionsWithDetails
  }

  // Get promotions for specific product
  async getProductPromotions(productId: string, variantId?: string) {
    const whereClause: any = { 
      product_id: productId,
      is_active: true
    }
    
    if (variantId) {
      whereClause.variant_id = variantId
    }
    
    const productPromotions = await this.listProductPromotions({
      where: whereClause,
    })
    
    // Get supplier promotion details for each product promotion
    const promotionsWithDetails = await Promise.all(
      productPromotions.map(async (pp) => {
        const supplierPromotion = await this.retrieveSupplierPromotion(pp.supplier_promotion_id)
        return {
          ...pp,
          supplier_promotion: supplierPromotion,
        }
      })
    )
    
    return promotionsWithDetails
  }

  // Get all active promotions for smart restock analysis
  async getActivePromotionsForAnalysis() {
    const activePromotions = await this.listSupplierPromotions({
      where: { status: "active" },
    })
    
    const promotionsWithDetails = await Promise.all(
      activePromotions.map(async (promotion) => {
        let brandPromotions: any[] = []
        let productPromotions: any[] = []
        
        if (promotion.promotion_type === "brand") {
          brandPromotions = await this.listBrandPromotions({
            where: {
              supplier_promotion_id: promotion.id,
              is_active: true,
            },
          }) as any[]
        } else if (promotion.promotion_type === "product") {
          productPromotions = await this.listProductPromotions({
            where: {
              supplier_promotion_id: promotion.id,
              is_active: true,
            },
          }) as any[]
        }
        
        return {
          ...promotion,
          brand_promotions: brandPromotions,
          product_promotions: productPromotions,
        }
      })
    )
    
    return promotionsWithDetails
  }

  // Update promotion usage
  async updatePromotionUsage(promotionId: string, usageCount: number = 1) {
    const promotion = await this.retrieveSupplierPromotion(promotionId)
    const newUsage = (promotion.current_usage || 0) + usageCount
    
    await this.updateSupplierPromotions({
      id: promotionId,
      current_usage: newUsage,
      status: promotion.max_usage && newUsage >= promotion.max_usage ? "expired" : promotion.status,
    })
  }

  // Check if promotion is valid
  async isPromotionValid(promotionId: string) {
    const promotion = await this.retrieveSupplierPromotion(promotionId)
    const now = new Date()
    
    return (
      promotion.status === "active" &&
      new Date(promotion.start_date) <= now &&
      new Date(promotion.end_date) >= now &&
      (!promotion.max_usage || (promotion.current_usage || 0) < promotion.max_usage)
    )
  }

  // Get promotion analytics
  async getPromotionAnalytics(supplierId?: string) {
    const whereClause: any = {}
    if (supplierId) {
      whereClause.supplier_id = supplierId
    }
    
    const allPromotions = await this.listSupplierPromotions({
      where: whereClause,
    })
    
    const activePromotions = allPromotions.filter(p => p.status === "active")
    const expiredPromotions = allPromotions.filter(p => p.status === "expired")
    const scheduledPromotions = allPromotions.filter(p => p.status === "scheduled")
    
    const totalUsage = allPromotions.reduce((sum, p) => sum + (p.current_usage || 0), 0)
    const averageUsage = allPromotions.length > 0 ? totalUsage / allPromotions.length : 0
    
    return {
      totalPromotions: allPromotions.length,
      activePromotions: activePromotions.length,
      expiredPromotions: expiredPromotions.length,
      scheduledPromotions: scheduledPromotions.length,
      totalUsage,
      averageUsage,
    }
  }
}

export default SupplierModuleService 