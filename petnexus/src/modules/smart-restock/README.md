# Smart Restock Module

## Overview

The Smart Restock Module is an AI-powered inventory management system that integrates supplier promotions with product analytics to provide intelligent restock recommendations. It leverages machine learning to optimize inventory levels, reduce stockouts, and maximize profitability through promotional opportunities.

## Features

### 🤖 AI-Powered Analysis
- **OpenRouter Integration**: Uses advanced AI models for intelligent restock recommendations
- **Sales Velocity Analysis**: Calculates product movement patterns and predicts future demand
- **Profit Margin Optimization**: Identifies high-profit opportunities and optimal restock quantities
- **Risk Assessment**: Evaluates inventory risks and provides mitigation strategies

### 🎁 Promotion Integration
- **Supplier Promotion Awareness**: Integrates with supplier promotion data for enhanced recommendations
- **Promotional Opportunity Detection**: Identifies products with active promotions for strategic restocking
- **Promotion-Enhanced Quantities**: Adjusts restock quantities based on promotional periods and discounts
- **Brand-Level Promotions**: Considers brand-wide promotional campaigns in restock decisions

### 📊 Advanced Analytics
- **Product Categorization**: Automatically categorizes products into:
  - Fast Moving, Low Stock (urgent restock needed)
  - Slow Moving, High Stock (reduce stock levels)
  - High Profit Potential (capitalize on profitability)
  - Supplier Promotions (promotional opportunities)
  - Regular Restock (standard inventory management)

- **Performance Scoring**: Calculates product performance scores based on:
  - Sales velocity
  - Profit margins
  - Stock optimization
  - Promotion status

- **Risk Level Assessment**: Evaluates inventory risks as Low, Medium, or High

### 🔄 Workflow Integration
- **Automated Workflows**: Complete restock analysis workflow with multiple steps
- **Notification System**: Email notifications for completed analyses
- **Restock Order Creation**: Automatic generation of restock orders from recommendations
- **Supplier Integration**: Seamless integration with existing supplier management system

## Architecture

### Data Models

#### AI Analysis (`ai-analysis.ts`)
```typescript
interface AIAnalysis {
  id: string
  restock_order_id?: string
  request_data: string
  ai_model: string
  ai_response: string
  analysis_summary: string
  recommended_products: string
  priority_scores: string
  status: "pending" | "processing" | "completed" | "failed"
  confidence_score: number
  processed_at: string
}
```

#### Restock Recommendation (`restock-recommendation.ts`)
```typescript
interface RestockRecommendation {
  id: string
  ai_analysis_id: string
  product_id: string
  variant_id: string
  category: "fast_moving_low_stock" | "slow_moving_high_stock" | "high_profit_potential" | "supplier_promotions" | "regular_restock"
  priority_score: number
  recommended_quantity: number
  reasoning: string
  confidence_level: number
  current_stock: number
  current_sales_velocity: number
  current_profit_margin: number
  has_active_promotion: boolean
  promotion_details?: string
  is_implemented: boolean
  implemented_at?: string
}
```

#### Product Analytics (`product-analytics.ts`)
```typescript
interface ProductAnalytics {
  id: string
  product_id: string
  variant_id: string
  sales_velocity: number
  total_sales: number
  sales_period_days: number
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  unit_price: number
  unit_cost: number
  profit_margin: number
  has_active_promotion: boolean
  promotion_details?: string
  performance_score: number
  risk_level: "low" | "medium" | "high"
  analytics_date: string
}
```

### Services

#### SmartRestockService
Main service providing:
- Product analytics collection
- AI analysis execution
- Restock recommendation generation
- Integration with supplier promotions
- Performance scoring and risk assessment

#### AIService
Dedicated AI service for:
- OpenRouter API integration
- Prompt construction and optimization
- AI response parsing and validation
- Confidence scoring

### API Routes

#### GET `/admin/smart-restock`
Retrieves smart restock analytics with optional filtering:
- `supplier_id`: Filter by specific supplier
- `period`: Analysis period in days (7-365)
- `include_promotions`: Include promotion data

#### POST `/admin/smart-restock`
Generates comprehensive smart restock analysis:
```json
{
  "supplier_id": "optional_supplier_id",
  "include_ai_analysis": true,
  "analysis_period": 30,
  "include_promotions": true
}
```

### Admin UI

The Smart Restock admin interface provides:
- **Analysis Controls**: Supplier selection, period configuration
- **Analytics Dashboard**: Real-time summary of product categories
- **AI Analysis Results**: Confidence scores and analysis summaries
- **Recommendation Display**: Detailed restock recommendations with reasoning
- **Promotion Highlights**: Visual indicators for promotional opportunities

## Installation & Setup

### 1. Module Registration
Add the smart-restock module to your `medusa-config.ts`:
```typescript
modules: [
  {
    resolve: "./src/modules/smart-restock",
  },
]
```

### 2. Database Migration
Generate and run migrations:
```bash
npx medusa db:generate smart-restock
npx medusa db:migrate
```

### 3. Environment Variables
Configure OpenRouter API for AI analysis:
```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=moonshotai/kimi-k2:free
```

### 4. Admin UI Access
The Smart Restock page is automatically available in the admin interface at `/admin/smart-restock`.

## Usage Examples

### Basic Analytics Collection
```typescript
const smartRestockService = container.resolve(SMART_RESTOCK_MODULE)

const analytics = await smartRestockService.collectProductAnalytics({
  period: 30,
  include_supplier_promotions: true,
  include_profit_margins: true
})
```

### AI-Powered Analysis
```typescript
const aiAnalysis = await smartRestockService.performAIAnalysis(analytics)

const recommendations = await smartRestockService.getRestockRecommendations(aiAnalysis.id)
```

### Supplier-Specific Analysis
```typescript
const supplierAnalytics = await smartRestockService.collectProductAnalytics({
  period: 30,
  supplier_id: "supplier_123",
  include_supplier_promotions: true
})
```

### Restock Order Creation
```typescript
const restockOrder = await smartRestockService.createRestockOrderFromRecommendations(
  recommendations,
  "supplier_123"
)
```

## Workflow Integration

The Smart Restock workflow can be triggered programmatically:

```typescript
import { smartRestockWorkflow } from "../workflows/smart-restock-workflow"

const result = await smartRestockWorkflow.run({
  supplier_id: "supplier_123",
  analysis_period: 30,
  include_promotions: true,
  include_ai_analysis: true,
  auto_create_restock_order: false,
  notification_email: "admin@example.com"
})
```

## Testing

Run the comprehensive test suite:
```bash
npx ts-node src/scripts/test-smart-restock.ts
```

The test suite covers:
- Analytics collection
- AI analysis execution
- Promotion integration
- Supplier filtering
- Recommendation generation

## Configuration

### AI Model Configuration
Configure AI models in the AIService:
```typescript
// src/modules/smart-restock/services/ai-service.ts
const AI_MODEL = process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2:free"
const API_KEY = process.env.OPENROUTER_API_KEY
```

### Performance Thresholds
Adjust categorization thresholds in SmartRestockService:
```typescript
// Fast moving threshold
if (salesVelocity > 10 && currentStock < 20) return "fast_moving_low_stock"

// High profit threshold
if (profitMargin > 50 && currentStock < 30) return "high_profit_potential"
```

## Best Practices

### 1. Regular Analysis
- Run smart restock analysis weekly for optimal results
- Adjust analysis periods based on product lifecycle
- Monitor AI confidence scores for quality assurance

### 2. Promotion Integration
- Keep supplier promotion data up-to-date
- Review promotional recommendations before implementation
- Consider seasonal promotion patterns

### 3. Performance Optimization
- Use supplier filtering for large product catalogs
- Implement caching for frequently accessed analytics
- Monitor API rate limits for AI analysis

### 4. Risk Management
- Review high-risk recommendations manually
- Implement approval workflows for large restock orders
- Monitor stockout prevention effectiveness

## Troubleshooting

### Common Issues

1. **AI Analysis Failures**
   - Check OpenRouter API key configuration
   - Verify API rate limits
   - Review prompt construction logic

2. **Missing Promotion Data**
   - Ensure supplier module is properly configured
   - Verify promotion data synchronization
   - Check promotion status filters

3. **Performance Issues**
   - Implement pagination for large datasets
   - Use supplier filtering to reduce analysis scope
   - Consider background job processing

### Debug Mode
Enable debug logging:
```typescript
// In service methods
console.log("Debug: Analytics collection started", { period, supplier_id })
```

## Contributing

When contributing to the Smart Restock module:

1. Follow MedusaJS coding standards
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility
5. Test with real promotion data

## License

This module is part of the PETNEXUS project and follows the same licensing terms. 