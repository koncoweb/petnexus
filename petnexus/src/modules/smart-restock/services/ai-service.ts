class AIService {
  private readonly API_KEY = "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"
  private readonly MODEL = "moonshotai/kimi-k2:free"
  private readonly BASE_URL = "https://openrouter.ai/api/v1"

  async analyzeRestockRecommendations(analyticsData: any) {
    try {
      const prompt = this.buildAnalysisPrompt(analyticsData)
      
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://petnexus.com",
          "X-Title": "PetNexus Smart Restock"
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: "system",
              content: "You are an expert inventory management AI assistant. Analyze product data and provide smart restock recommendations based on sales velocity, profit margins, stock levels, and supplier promotions."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return this.parseAIResponse(result)
    } catch (error) {
      console.error("AI analysis error:", error)
      throw new Error(`Failed to analyze restock recommendations: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private buildAnalysisPrompt(analyticsData: any) {
    const { products, promotions, period } = analyticsData
    
    return `
    Analyze the following product data and provide smart restock recommendations:

    ANALYSIS PERIOD: ${period} days

    PRODUCT ANALYTICS DATA:
    ${JSON.stringify(products, null, 2)}

    SUPPLIER PROMOTIONS DATA:
    ${JSON.stringify(promotions, null, 2)}

    Please categorize products into the following 5 categories and provide recommendations:

    1. FAST MOVING, LOW STOCK: Products with high sales velocity but low stock
    2. SLOW MOVING, HIGH STOCK: Products with low sales velocity but high stock  
    3. HIGH PROFIT POTENTIAL: Products with high profit margins but low stock
    4. SUPPLIER PROMOTIONS: Products with active supplier promotions
    5. REGULAR RESTOCK: Products needing regular restock

    For each category, provide:
    - Product IDs and names
    - Recommended restock quantities
    - Priority scores (1-100)
    - Reasoning for recommendations
    - Confidence level (0-1)

    Consider the following factors:
    - Sales velocity trends
    - Current stock levels vs minimum/maximum thresholds
    - Profit margins and revenue potential
    - Active supplier promotions and their impact
    - Seasonal trends and market demand
    - Stock turnover rates

    Return your response in this JSON format:
    {
      "analysis_summary": "Brief summary of findings",
      "recommendations": {
        "fast_moving_low_stock": [
          {
            "product_id": "prod_123",
            "product_name": "Product Name",
            "variant_id": "var_456",
            "recommended_quantity": 50,
            "priority_score": 85,
            "reasoning": "High sales velocity (10 units/day) with only 5 days of stock remaining",
            "confidence_level": 0.9
          }
        ],
        "slow_moving_high_stock": [...],
        "high_profit_potential": [...],
        "supplier_promotions": [...],
        "regular_restock": [...]
      },
      "overall_confidence": 0.85,
      "total_recommendations": 15,
      "estimated_restock_value": 5000
    }
    `
  }

  private parseAIResponse(aiResponse: any) {
    try {
      const content = aiResponse.choices[0].message.content
      const parsed = JSON.parse(content)
      
      return {
        analysis_summary: parsed.analysis_summary,
        recommendations: parsed.recommendations,
        confidence_score: parsed.overall_confidence,
        total_recommendations: parsed.total_recommendations,
        estimated_restock_value: parsed.estimated_restock_value,
        raw_response: aiResponse,
        processed_at: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async validateAIResponse(aiResponse: any) {
    const requiredFields = ['analysis_summary', 'recommendations', 'confidence_score']
    const requiredCategories = ['fast_moving_low_stock', 'slow_moving_high_stock', 'high_profit_potential', 'supplier_promotions', 'regular_restock']
    
    // Check required fields
    for (const field of requiredFields) {
      if (!aiResponse[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    // Check required categories
    for (const category of requiredCategories) {
      if (!aiResponse.recommendations[category]) {
        aiResponse.recommendations[category] = []
      }
    }
    
    // Validate confidence score
    if (aiResponse.confidence_score < 0 || aiResponse.confidence_score > 1) {
      throw new Error("Confidence score must be between 0 and 1")
    }
    
    return aiResponse
  }
}

export default AIService 