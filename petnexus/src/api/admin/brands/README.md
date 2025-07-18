# Brand API Documentation

This document describes the Brand API endpoints available in the Medusa application.

## Base URL
- **Admin API**: `/admin/brands`
- **Store API**: `/store/brands`

## Authentication
- **Admin endpoints** require authentication (JWT token)
- **Store endpoints** are publicly accessible

## Endpoints

### Admin API

#### 1. List All Brands
```http
GET /admin/brands
```

**Response:**
```json
{
  "brands": [
    {
      "id": "brand_123",
      "name": "Brand Name",
      "description": "Brand description",
      "logo_url": "https://example.com/logo.png",
      "website_url": "https://example.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### 2. Create Brand
```http
POST /admin/brands
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Brand Name",
  "description": "Brand description",
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://example.com"
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters
- `logo_url`: Optional, valid URL format
- `website_url`: Optional, valid URL format

**Response (201):**
```json
{
  "brand": {
    "id": "brand_123",
    "name": "Brand Name",
    "description": "Brand description",
    "logo_url": "https://example.com/logo.png",
    "website_url": "https://example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Brand created successfully"
}
```

#### 3. Get Brand by ID
```http
GET /admin/brands/:id
```

**Response:**
```json
{
  "brand": {
    "id": "brand_123",
    "name": "Brand Name",
    "description": "Brand description",
    "logo_url": "https://example.com/logo.png",
    "website_url": "https://example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. Update Brand
```http
PUT /admin/brands/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Brand Name",
  "description": "Updated description"
}
```

**Validation Rules:**
- `name`: Optional, 1-100 characters (if provided)
- `description`: Optional, max 500 characters
- `logo_url`: Optional, valid URL format
- `website_url`: Optional, valid URL format

**Response:**
```json
{
  "brand": {
    "id": "brand_123",
    "name": "Updated Brand Name",
    "description": "Updated description",
    "logo_url": "https://example.com/logo.png",
    "website_url": "https://example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Brand updated successfully"
}
```

#### 5. Delete Brand
```http
DELETE /admin/brands/:id
```

**Response (204):**
```json
{
  "message": "Brand deleted successfully"
}
```

### Store API

#### 1. List All Brands (Public)
```http
GET /store/brands
```

**Response:**
```json
{
  "brands": [
    {
      "id": "brand_123",
      "name": "Brand Name",
      "description": "Brand description",
      "logo_url": "https://example.com/logo.png",
      "website_url": "https://example.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

## Error Responses

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Brand name is required",
      "path": ["name"]
    }
  ]
}
```

### Not Found Error (404)
```json
{
  "error": "Brand not found",
  "message": "Brand with ID 'brand_123' not found"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

## Middleware

The following middleware is applied to all brand endpoints:

1. **Logger**: Logs all requests with timestamp
2. **Error Handler**: Catches and formats errors
3. **Validation**: Validates request data using Zod schemas

## Usage Examples

### Using cURL

#### Create a Brand
```bash
curl -X POST http://localhost:9000/admin/brands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Brand",
    "description": "A test brand",
    "logo_url": "https://example.com/logo.png",
    "website_url": "https://example.com"
  }'
```

#### Update a Brand
```bash
curl -X PUT http://localhost:9000/admin/brands/brand_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Brand Name",
    "description": "Updated description"
  }'
```

#### List Brands (Public)
```bash
curl -X GET http://localhost:9000/store/brands
```

### Using JavaScript/Fetch

#### Create a Brand
```javascript
const response = await fetch('/admin/brands', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    name: 'Test Brand',
    description: 'A test brand',
    logo_url: 'https://example.com/logo.png',
    website_url: 'https://example.com'
  })
});

const result = await response.json();
```

## Workflow Integration

All brand operations use Medusa workflows for:
- Input validation
- Business logic execution
- Error handling and rollback
- Data consistency

The workflows ensure that all brand operations are atomic and can be rolled back if any step fails. 