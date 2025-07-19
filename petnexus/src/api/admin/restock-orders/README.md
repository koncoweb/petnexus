# Restock Orders API Documentation

## Overview

The Restock Orders API provides comprehensive functionality for managing inventory restocking operations. This module allows administrators to create, track, and manage restock orders from suppliers.

## Base URL

All endpoints are prefixed with `/admin/restock-orders`

## Authentication

All endpoints require admin authentication. Include the appropriate authentication headers in your requests.

## Endpoints

### 1. List All Restock Orders

**GET** `/admin/restock-orders`

Retrieve a paginated list of all restock orders with optional filtering.

#### Query Parameters

- `status` (optional): Filter by order status
  - Values: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`, `all`
  - Default: `all`
- `page` (optional): Page number for pagination
  - Default: `1`
- `limit` (optional): Number of items per page
  - Default: `20`

#### Example Request

```bash
GET /admin/restock-orders?status=pending&page=1&limit=10
```

#### Example Response

```json
{
  "restock_orders": [
    {
      "id": "ro_123",
      "supplier_id": "sup_456",
      "status": "pending",
      "total_items": 5,
      "total_cost": 1500.00,
      "currency_code": "USD",
      "notes": "Monthly restock order",
      "expected_delivery_date": "2024-02-15",
      "actual_delivery_date": null,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 25,
  "page": 1,
  "limit": 20
}
```

### 2. Create Restock Order

**POST** `/admin/restock-orders`

Create a new restock order with optional items.

#### Request Body

```json
{
  "supplier_id": "sup_456",
  "total_items": 5,
  "total_cost": 1500.00,
  "currency_code": "USD",
  "notes": "Monthly restock order",
  "expected_delivery_date": "2024-02-15",
  "items": [
    {
      "product_id": "prod_123",
      "variant_id": "var_456",
      "quantity": 10,
      "unit_cost": 15.00,
      "notes": "High priority item"
    }
  ]
}
```

#### Example Response

```json
{
  "order": {
    "id": "ro_123",
    "supplier_id": "sup_456",
    "status": "pending",
    "total_items": 5,
    "total_cost": 1500.00,
    "currency_code": "USD",
    "notes": "Monthly restock order",
    "expected_delivery_date": "2024-02-15",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### 3. Get Restock Order Details

**GET** `/admin/restock-orders/{id}`

Retrieve detailed information about a specific restock order including its items.

#### Example Request

```bash
GET /admin/restock-orders/ro_123
```

#### Example Response

```json
{
  "order": {
    "id": "ro_123",
    "supplier_id": "sup_456",
    "status": "pending",
    "total_items": 5,
    "total_cost": 1500.00,
    "currency_code": "USD",
    "notes": "Monthly restock order",
    "expected_delivery_date": "2024-02-15",
    "actual_delivery_date": null,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "items": [
      {
        "id": "roi_789",
        "restock_order_id": "ro_123",
        "product_id": "prod_123",
        "variant_id": "var_456",
        "quantity": 10,
        "unit_cost": 15.00,
        "total_cost": 150.00,
        "notes": "High priority item",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### 4. Update Restock Order Status

**PATCH** `/admin/restock-orders/{id}`

Update the status and other details of a restock order.

#### Request Body

```json
{
  "status": "confirmed",
  "notes": "Order confirmed by supplier",
  "expected_delivery_date": "2024-02-20"
}
```

#### Example Response

```json
{
  "order": {
    "id": "ro_123",
    "supplier_id": "sup_456",
    "status": "confirmed",
    "total_items": 5,
    "total_cost": 1500.00,
    "currency_code": "USD",
    "notes": "Order confirmed by supplier",
    "expected_delivery_date": "2024-02-20",
    "actual_delivery_date": null,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

### 5. Delete Restock Order

**DELETE** `/admin/restock-orders/{id}`

Delete a restock order and all its associated items.

#### Example Request

```bash
DELETE /admin/restock-orders/ro_123
```

#### Response

- **204 No Content**: Order successfully deleted

### 6. Get Restock Order Analytics

**GET** `/admin/restock-orders/analytics`

Retrieve analytics and metrics for all restock orders.

#### Example Request

```bash
GET /admin/restock-orders/analytics
```

#### Example Response

```json
{
  "analytics": {
    "totalOrders": 150,
    "pendingOrders": 25,
    "confirmedOrders": 30,
    "shippedOrders": 45,
    "deliveredOrders": 40,
    "cancelledOrders": 10,
    "totalValue": 75000.00,
    "averageOrderValue": 500.00
  }
}
```

### 7. Manage Restock Order Items

#### 7.1 List Items

**GET** `/admin/restock-orders/{id}/items`

Get all items for a specific restock order.

#### 7.2 Add Item

**POST** `/admin/restock-orders/{id}/items`

Add a new item to an existing restock order.

#### Request Body

```json
{
  "product_id": "prod_789",
  "variant_id": "var_012",
  "quantity": 5,
  "unit_cost": 20.00,
  "notes": "Additional item"
}
```

#### 7.3 Update Item

**PATCH** `/admin/restock-orders/{id}/items/{itemId}`

Update an existing restock order item.

#### Request Body

```json
{
  "quantity": 8,
  "unit_cost": 18.00,
  "notes": "Updated quantity and price"
}
```

#### 7.4 Delete Item

**DELETE** `/admin/restock-orders/{id}/items/{itemId}`

Remove an item from a restock order.

#### 7.5 Get Item Details

**GET** `/admin/restock-orders/{id}/items/{itemId}`

Get detailed information about a specific restock order item.

## Status Flow

Restock orders follow this status progression:

1. **pending** → **confirmed** or **cancelled**
2. **confirmed** → **shipped** or **cancelled**
3. **shipped** → **delivered**
4. **delivered** → (final state)
5. **cancelled** → (final state)

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content to return
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Validation Rules

### Restock Order
- `supplier_id`: Required string
- `total_items`: Required number, minimum 1
- `total_cost`: Required number, minimum 0
- `currency_code`: Optional string, defaults to "USD"
- `notes`: Optional string
- `expected_delivery_date`: Optional string (ISO date format)

### Restock Order Item
- `product_id`: Required string
- `variant_id`: Required string
- `quantity`: Required number, minimum 1
- `unit_cost`: Required number, minimum 0
- `notes`: Optional string

## Rate Limiting

API requests are subject to rate limiting. Please implement appropriate retry logic with exponential backoff.

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (max 100)

Response includes pagination metadata:
- `count`: Total number of items
- `page`: Current page number
- `limit`: Items per page 