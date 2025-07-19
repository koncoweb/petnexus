# Smart Restock API Documentation

## Overview

The Smart Restock API provides AI-powered inventory management with supplier promotion integration. It automatically analyzes product performance, generates intelligent restock recommendations, and can create restock orders directly from AI analysis.

## API Endpoints

### 1. GET `/admin/smart-restock`

Retrieves smart restock analytics with optional filtering.

#### Query Parameters
- `supplier_id` (optional): Filter by specific supplier
- `period` (optional): Analysis period in days (default: 30, range: 7-365)
- `include_promotions` (optional): Include promotion data (default: true)

#### Example Request
```bash
GET /admin/smart-restock?supplier_id=supplier_123&period=30&include_promotions=true
```

#### Response
```json
{
  "analytics": {
    "period": 30,
    "products": [
      {
        "product_id": "prod_123",
        "variant_id": "var_456",
        "product_name": "Premium Dog Food",
        "sales_velocity": 15.2,
        "current_stock": 25,
        "unit_price": 29.99,
        "unit_cost": 18.50,
        "profit_margin": 38.3,
        "category": "fast_moving_low_stock",
        "has_active_promotion": true,
        "promotion_details": "20% off this month",
        "performance_score": 85,
        "risk_level": "medium"
      }
    ],
    "summary": {
      "total_products": 150,
      "fast_moving_count": 25,
      "slow_moving_count": 10,
      "high_profit_count": 15,
      "promotion_count": 8
    }
  },
  "summary": {
    "total_products": 150,
    "fast_moving_count": 25,
    "slow_moving_count": 10,
    "high_profit_count": 15,
    "promotion_count": 8
  }
}
```

### 2. POST `/admin/smart-restock`

Generates comprehensive smart restock analysis with AI recommendations.

#### Request Body
```json
{
  "supplier_id": "supplier_123",
  "include_ai_analysis": true,
  "analysis_period": 30,
  "include_promotions": true
}
```

#### Response
```json
{
  "success": true,
  "analytics": {
    "period": 30,
    "products": [...],
    "summary": {...}
  },
  "ai_analysis": {
    "id": "ai_analysis_123",
    "status": "completed",
    "analysis_summary": "AI analysis completed successfully with high confidence",
    "confidence_score": 0.85,
    "processed_at": "2025-07-19T12:00:00Z"
  },
  "recommendations": {
    "fast_moving_low_stock": [
      {
        "product_id": "prod_123",
        "product_name": "Premium Dog Food",
        "recommended_quantity": 50,
        "priority_score": 85,
        "reasoning": "High sales velocity with low stock - urgent restock needed",
        "confidence_level": 0.9,
        "current_stock": 25,
        "current_sales_velocity": 15.2,
        "current_profit_margin": 38.3,
        "has_active_promotion": true,
        "risk_level": "medium"
      }
    ],
    "high_profit_potential": [...],
    "supplier_promotions": [...],
    "regular_restock": [...],
    "slow_moving_high_stock": [...],
    "total_items": 45,
    "total_cost": 1250.75
  },
  "message": "Smart restock analysis completed successfully"
}
```

### 3. POST `/admin/smart-restock/create-restock-order`

Creates a restock order directly from smart restock recommendations.

#### Request Body
```json
{
  "supplier_id": "supplier_123",
  "analysis_period": 30,
  "include_promotions": true,
  "include_ai_analysis": true,
  "auto_approve": false,
  "notes": "Created from Smart Restock analysis"
}
```

#### Response
```json
{
  "success": true,
  "restock_order": {
    "id": "restock_order_123",
    "supplier_id": "supplier_123",
    "total_items": 15,
    "total_cost": 1250.75,
    "currency_code": "USD",
    "status": "pending",
    "notes": "Created from Smart Restock analysis",
    "expected_delivery_date": "2025-08-02T00:00:00Z",
    "created_at": "2025-07-19T12:00:00Z"
  },
  "analytics_summary": {
    "total_products": 150,
    "fast_moving_count": 25,
    "slow_moving_count": 10,
    "high_profit_count": 15,
    "promotion_count": 8
  },
  "ai_analysis": {
    "id": "ai_analysis_123",
    "confidence_score": 0.85,
    "analysis_summary": "AI analysis completed successfully"
  },
  "recommendations": {
    "total_items": 15,
    "total_quantity": 250,
    "total_cost": 1250.75,
    "categories": {
      "fast_moving": 8,
      "high_profit": 4,
      "promotions": 2,
      "regular": 1
    }
  },
  "message": "Restock order created successfully from smart restock analysis"
}
```

## Product Categories

The Smart Restock system categorizes products into 5 main categories:

### 1. Fast Moving, Low Stock
- **Criteria**: High sales velocity (>10 units/day) with low stock (<20 units)
- **Action**: Urgent restock needed
- **Priority**: High (85-100 points)

### 2. Slow Moving, High Stock
- **Criteria**: Low sales velocity (<2 units/day) with high stock (>100 units)
- **Action**: Reduce stock levels, no restock recommended
- **Priority**: Low (20-40 points)

### 3. High Profit Potential
- **Criteria**: High profit margin (>50%) with low stock (<30 units)
- **Action**: Capitalize on profitability
- **Priority**: Medium-High (70-85 points)

### 4. Supplier Promotions
- **Criteria**: Products with active supplier promotions
- **Action**: Strategic restocking to capitalize on promotional opportunities
- **Priority**: Very High (90-100 points)
- **Quantity Boost**: 1.5x normal quantity

### 5. Regular Restock
- **Criteria**: Standard inventory management
- **Action**: Normal restock based on sales velocity
- **Priority**: Medium (50-70 points)

## Performance Scoring

Each product receives a performance score (0-100) based on:

- **Sales Velocity** (40 points): Higher velocity = higher score
- **Profit Margin** (30 points): Higher margin = higher score
- **Stock Optimization** (20 points): Optimal stock levels = higher score
- **Promotion Bonus** (10 points): Active promotions = bonus points

## Risk Assessment

Products are assigned risk levels:

- **Low Risk**: Stable performance, adequate stock
- **Medium Risk**: Some concerns with stock or performance
- **High Risk**: Urgent action needed (stockout risk, poor performance)

## Promotion Integration

### How Promotions Affect Recommendations

1. **Detection**: System automatically detects active supplier promotions
2. **Quantity Boost**: Recommended quantities are increased by 1.5x for promotional items
3. **Priority Boost**: Promotional items receive higher priority scores
4. **Categorization**: Products with promotions are categorized as "supplier_promotions"

### Promotion Types Supported

- **Product-level promotions**: Specific product discounts
- **Brand-level promotions**: Brand-wide promotional campaigns
- **Category promotions**: Category-specific promotional offers

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["supplier_id"],
      "message": "Required"
    }
  ]
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to perform smart restock analysis",
  "details": "Specific error message"
}
```

### Error Scenarios

1. **No Items Require Restocking**
   ```json
   {
     "error": "No items require restocking",
     "analytics_summary": {...},
     "ai_analysis": {...}
   }
   ```

2. **AI Analysis Failed**
   ```json
   {
     "error": "Failed to perform AI analysis",
     "details": "OpenRouter API error"
   }
   ```

## Usage Examples

### Basic Analytics Collection
```javascript
const response = await fetch('/admin/smart-restock?period=30&include_promotions=true')
const data = await response.json()
console.log('Analytics:', data.analytics)
```

### Generate AI Analysis
```javascript
const response = await fetch('/admin/smart-restock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    supplier_id: 'supplier_123',
    include_ai_analysis: true,
    analysis_period: 30,
    include_promotions: true
  })
})
const data = await response.json()
console.log('AI Analysis:', data.ai_analysis)
```

### Create Restock Order
```javascript
const response = await fetch('/admin/smart-restock/create-restock-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    supplier_id: 'supplier_123',
    analysis_period: 30,
    include_promotions: true,
    include_ai_analysis: true,
    auto_approve: false,
    notes: 'Created from Smart Restock analysis'
  })
})
const data = await response.json()
console.log('Restock Order:', data.restock_order)
```

## Best Practices

### 1. Regular Analysis
- Run analysis weekly for optimal results
- Adjust periods based on product lifecycle
- Monitor AI confidence scores

### 2. Supplier Selection
- Use supplier filtering for large catalogs
- Consider supplier-specific promotions
- Review supplier performance regularly

### 3. Promotion Management
- Keep promotion data up-to-date
- Review promotional recommendations
- Consider seasonal patterns

### 4. Error Handling
- Implement retry logic for API calls
- Handle network timeouts gracefully
- Log errors for debugging

## Rate Limits

- **GET requests**: 100 requests per minute
- **POST requests**: 20 requests per minute
- **AI analysis**: 10 requests per minute (OpenRouter limits)

## Authentication

All endpoints require admin authentication. Include the appropriate authentication headers in your requests.

## Versioning

Current API version: v1.0

All endpoints are versioned and backward compatible within major versions. 