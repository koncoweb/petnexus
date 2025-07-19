import { defineRouteConfig } from "@medusajs/admin-sdk"
import { 
  Container, 
  Heading, 
  Button, 
  Text, 
  Badge, 
  Select,
  Alert,
} from "@medusajs/ui"
import { Gift, Plus, Sparkles, Tag } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

const SmartRestockPage = () => {
  const queryClient = useQueryClient()
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all")
  const [analysisPeriod, setAnalysisPeriod] = useState<number>(30)
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await fetch("/admin/suppliers")
      return response.json()
    },
  })

  // Fetch smart restock analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["smart-restock-analytics", selectedSupplier, analysisPeriod],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: analysisPeriod.toString(),
        include_promotions: "true"
      })
      if (selectedSupplier && selectedSupplier !== "all") {
        params.append("supplier_id", selectedSupplier)
      }
      const response = await fetch(`/admin/smart-restock?${params}`)
      return response.json()
    },
    enabled: true
  })

  // Generate smart restock analysis
  const generateAnalysisMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/admin/smart-restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-restock-analytics"] })
      setIsGenerating(false)
    },
  })

  // Create restock order from recommendations
  const createRestockOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/admin/smart-restock/create-restock-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: (data) => {
      console.log("Restock order created:", data)
      // Show success message or redirect to restock orders
    },
  })

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true)
    try {
      await generateAnalysisMutation.mutateAsync({
        supplier_id: selectedSupplier !== "all" ? selectedSupplier : undefined,
        include_ai_analysis: true,
        analysis_period: analysisPeriod,
        include_promotions: true
      })
    } catch (error) {
      console.error("Error generating analysis:", error)
      setIsGenerating(false)
    }
  }

  const handleCreateRestockOrder = async () => {
    if (!selectedSupplier || selectedSupplier === "all") {
      alert("Please select a specific supplier first")
      return
    }
    
    try {
      await createRestockOrderMutation.mutateAsync({
        supplier_id: selectedSupplier,
        analysis_period: analysisPeriod,
        include_promotions: true,
        include_ai_analysis: true,
        auto_approve: false,
        notes: "Created from Smart Restock analysis"
      })
    } catch (error) {
      console.error("Error creating restock order:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fast_moving_low_stock": return "bg-green-100 text-green-800"
      case "slow_moving_high_stock": return "bg-orange-100 text-orange-800"
      case "high_profit_potential": return "bg-purple-100 text-purple-800"
      case "supplier_promotions": return "bg-blue-100 text-blue-800"
      case "regular_restock": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "fast_moving_low_stock": return "Fast Moving, Low Stock"
      case "slow_moving_high_stock": return "Slow Moving, High Stock"
      case "high_profit_potential": return "High Profit Potential"
      case "supplier_promotions": return "Supplier Promotions"
      case "regular_restock": return "Regular Restock"
      default: return category
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">Smart Restock with AI</Heading>
          <Text size="base" className="text-ui-fg-subtle mt-1">
            AI-powered restock recommendations based on sales analytics and supplier promotions
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={handleGenerateAnalysis}
          disabled={isGenerating}
        >
          <Sparkles className="mr-2" />
          {isGenerating ? "Generating..." : "Generate Smart Analysis"}
        </Button>
      </div>

      {/* Analysis Controls */}
      <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6 mb-6">
        <Heading level="h2" className="mb-4">Analysis Settings</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Text size="small" weight="plus" className="mb-2 block">Supplier (Optional)</Text>
            <Select
              value={selectedSupplier}
              onValueChange={setSelectedSupplier}
            >
              <Select.Trigger>
                <Select.Value placeholder="All suppliers" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All suppliers</Select.Item>
                {suppliers?.suppliers?.map((supplier: any) => (
                  <Select.Item key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          
          <div>
            <Text size="small" weight="plus" className="mb-2 block">Analysis Period (Days)</Text>
            <Select
              value={analysisPeriod.toString()}
              onValueChange={(value) => setAnalysisPeriod(Number(value))}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="7">7 days</Select.Item>
                <Select.Item value="14">14 days</Select.Item>
                <Select.Item value="30">30 days</Select.Item>
                <Select.Item value="60">60 days</Select.Item>
                <Select.Item value="90">90 days</Select.Item>
              </Select.Content>
            </Select>
          </div>
          
          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              onClick={handleGenerateAnalysis}
              disabled={isGenerating}
            >
              <Plus className="mr-2" />
              {isGenerating ? "Analyzing..." : "Run Analysis"}
            </Button>
            
            {selectedSupplier && selectedSupplier !== "all" && (
              <Button
                variant="primary"
                onClick={handleCreateRestockOrder}
                disabled={createRestockOrderMutation.isPending}
              >
                <Gift className="mr-2" />
                {createRestockOrderMutation.isPending ? "Creating..." : "Create Restock Order"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {generateAnalysisMutation.isError && (
        <Alert variant="error" className="mb-6">
          Failed to generate smart restock analysis. Please try again.
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <Text>Loading smart restock analytics...</Text>
        </div>
      ) : analytics ? (
          <>
            {/* Analytics Summary */}
            <div className="mb-6">
              <Heading level="h2" className="mb-4">Analytics Summary</Heading>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 text-center hover:bg-ui-bg-base-hover transition-colors">
                  <div className="w-10 h-10 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <Text size="large" weight="plus" className="text-green-600 mb-1">
                    {analytics.summary?.fast_moving_count || 0}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">Fast Moving</Text>
                </div>
                
                <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 text-center hover:bg-ui-bg-base-hover transition-colors">
                  <div className="w-10 h-10 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-orange-600" />
                  </div>
                  <Text size="large" weight="plus" className="text-orange-600 mb-1">
                    {analytics.summary?.slow_moving_count || 0}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">Slow Moving</Text>
                </div>
                
                <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 text-center hover:bg-ui-bg-base-hover transition-colors">
                  <div className="w-10 h-10 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-purple-600" />
                  </div>
                  <Text size="large" weight="plus" className="text-purple-600 mb-1">
                    {analytics.summary?.high_profit_count || 0}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">High Profit</Text>
                </div>
                
                <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 text-center hover:bg-ui-bg-base-hover transition-colors">
                  <div className="w-10 h-10 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                  <Text size="large" weight="plus" className="text-blue-600 mb-1">
                    {analytics.summary?.promotion_count || 0}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">Promotions</Text>
                </div>
                
                <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 text-center hover:bg-ui-bg-base-hover transition-colors">
                  <div className="w-10 h-10 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-gray-600" />
                  </div>
                  <Text size="large" weight="plus" className="text-gray-600 mb-1">
                    {analytics.summary?.total_products || 0}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">Total Products</Text>
                </div>
              </div>
            </div>

            {/* AI Analysis Results */}
            {analytics.ai_analysis && (
              <div className="mb-6">
                <Heading level="h2" className="mb-4">AI Analysis Results</Heading>
                <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <Text size="base" weight="plus">AI Analysis Summary</Text>
                  </div>
                  <Text size="base" className="text-ui-fg-subtle mb-4 leading-relaxed">
                    {analytics.ai_analysis.analysis_summary}
                  </Text>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge className="bg-green-100 text-green-800 border border-green-200">
                      Confidence: {Math.round(analytics.ai_analysis.confidence_score * 100)}%
                    </Badge>
                    <Text size="small" className="text-ui-fg-subtle">
                      Processed: {new Date(analytics.ai_analysis.processed_at).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {/* Product Recommendations */}
            {analytics.recommendations && (
              <div className="mb-6">
                <Heading level="h2" className="mb-4">Restock Recommendations</Heading>
                
                {Object.entries(analytics.recommendations).map(([category, items]: [string, any]) => {
                  if (!Array.isArray(items) || items.length === 0) return null
                  
                  return (
                    <div key={category} className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Gift className="text-blue-600" />
                        <Heading level="h3">{getCategoryName(category)}</Heading>
                        <Badge className={getCategoryColor(category)}>
                          {items.length} items
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {items.slice(0, 5).map((item: any, index: number) => (
                          <div key={index} className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 hover:bg-ui-bg-base-hover transition-colors">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Gift className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <Text size="base" weight="plus" className="mb-1">{item.product_name}</Text>
                                  <Badge className={getRiskLevelColor(item.risk_level || "medium")}>
                                    {item.risk_level || "medium"} risk
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <Text size="large" weight="plus" className="text-green-600 mb-1">
                                  {item.recommended_quantity} units
                                </Text>
                                <Text size="small" className="text-ui-fg-subtle">
                                  Priority: {item.priority_score || 50}
                                </Text>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="bg-ui-bg-subtle rounded-lg p-3">
                                <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">Sales Velocity</Text>
                                <Text size="base" weight="plus">{item.sales_velocity?.toFixed(1) || "N/A"} units/day</Text>
                              </div>
                              <div className="bg-ui-bg-subtle rounded-lg p-3">
                                <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">Current Stock</Text>
                                <Text size="base" weight="plus">{item.current_stock || 0} units</Text>
                              </div>
                              <div className="bg-ui-bg-subtle rounded-lg p-3">
                                <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">Profit Margin</Text>
                                <Text size="base" weight="plus">{item.profit_margin?.toFixed(1) || "N/A"}%</Text>
                              </div>
                              <div className="bg-ui-bg-subtle rounded-lg p-3">
                                <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">Performance</Text>
                                <Text size="base" weight="plus">{item.performance_score || 0}/100</Text>
                              </div>
                            </div>
                            
                            {item.reasoning && (
                              <div className="bg-ui-bg-subtle rounded-lg p-4 mb-3">
                                <Text size="small" className="text-ui-fg-subtle leading-relaxed">
                                  {item.reasoning}
                                </Text>
                              </div>
                            )}
                            
                            {item.has_active_promotion && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-blue-600" />
                                  <Text size="small" className="text-blue-600 font-medium">
                                    Active supplier promotion available
                                  </Text>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {items.length > 5 && (
                        <Text size="small" className="text-ui-fg-subtle mt-2">
                          +{items.length - 5} more recommendations
                        </Text>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Summary Statistics */}
            {analytics.recommendations && (
              <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6">
                <Heading level="h2" className="mb-4">Summary</Heading>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-ui-bg-base rounded-lg p-4">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">Total Items</Text>
                    <Text size="large" weight="plus">{analytics.recommendations.total_items || 0}</Text>
                  </div>
                  <div className="bg-ui-bg-base rounded-lg p-4">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">Estimated Cost</Text>
                    <Text size="large" weight="plus">${analytics.recommendations.total_cost?.toLocaleString() || 0}</Text>
                  </div>
                  <div className="bg-ui-bg-base rounded-lg p-4">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">AI Confidence</Text>
                    <Text size="large" weight="plus">{Math.round((analytics.ai_analysis?.confidence_score || 0) * 100)}%</Text>
                  </div>
                  <div className="bg-ui-bg-base rounded-lg p-4">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">Analysis Period</Text>
                    <Text size="large" weight="plus">{analysisPeriod} days</Text>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="mx-auto mb-2 text-ui-fg-subtle" />
            <Text size="small" className="text-ui-fg-subtle">
              No analytics data available. Generate a smart restock analysis to get started.
            </Text>
          </div>
        )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Smart Restock",
  icon: Sparkles,
})

export default SmartRestockPage 