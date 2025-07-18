# Brand Module

A custom Medusa module for managing brands in your e-commerce application.

## Features

- Create, read, update, and delete brands
- Store brand information including name, description, logo URL, and website URL
- RESTful API endpoints for brand management

## Data Model

The Brand model includes the following fields:

- `id`: Primary key (auto-generated)
- `name`: Brand name (required)
- `description`: Brand description (optional)
- `logo_url`: URL to brand logo (optional)
- `website_url`: Brand website URL (optional)

## API Endpoints

### Admin API

#### List All Brands
```
GET /admin/brands
```

#### Create Brand
```
POST /admin/brands
Content-Type: application/json

{
  "name": "Brand Name",
  "description": "Brand description",
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://example.com"
}
```

#### Get Brand by ID
```
GET /admin/brands/:id
```

#### Update Brand
```
PUT /admin/brands/:id
Content-Type: application/json

{
  "name": "Updated Brand Name",
  "description": "Updated description"
}
```

#### Delete Brand
```
DELETE /admin/brands/:id
```

## Usage in Code

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import BrandModuleService from "../../../modules/brand/service"
import { BRAND_MODULE } from "../../../modules/brand"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const brandModuleService: BrandModuleService = req.scope.resolve(
    BRAND_MODULE
  )

  const brands = await brandModuleService.listAllBrands()

  res.json({
    brands
  })
}
```

## Database Migration

After setting up the module, generate and run the database migrations:

```bash
# Generate migration
npx medusa db:generate brand

# Run migration
npx medusa db:migrate
```

## Workflows

The Brand module includes workflows for creating and updating brands with validation:

### Create Brand Workflow
Located at `src/workflows/create-brand-simple.ts`

- Validates brand input (name required, length limits)
- Creates brand using the Brand module service
- Includes error handling and rollback capabilities

### Update Brand Workflow
Located at `src/workflows/update-brand.ts`

- Validates update input (ID required, length limits)
- Checks if brand exists before updating
- Updates brand using the Brand module service

## Module Configuration

The Brand module is configured in `medusa-config.ts`:

```typescript
module.exports = defineConfig({
  // ... other config
  modules: [
    {
      resolve: "./src/modules/brand",
    },
  ],
})
``` 