# Module Links

A module link forms an association between two data models of different modules, while maintaining module isolation.

> Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links)

## Product-Brand Link

This project includes a link between the Product module and the Brand module, allowing products to be associated with brands.

### Link Definition

```ts
import BrandModule from "../modules/brand"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  ProductModule.linkable.product,
  BrandModule.linkable.brand
)
```

This defines a link between the Product Module's `product` data model and the Brand Module's `brand` data model.

### Database Migration

To sync the links to the database, run:

```bash
npx medusa db:migrate
```

This creates the following link table:
- `product_product_brand_brand` - Links products to brands

### API Endpoints

The following API endpoints are available for managing product-brand relationships:

#### Get Product's Brands
```
GET /admin/products/:id/brands
```
Returns all brands linked to a specific product.

#### Link Product to Brand
```
POST /admin/products/:id/brands
Content-Type: application/json

{
  "brand_id": "brand-uuid-here"
}
```
Links a product to a brand.

#### Unlink Product from Brand
```
DELETE /admin/products/:id/brands
Content-Type: application/json

{
  "brand_id": "brand-uuid-here"
}
```
Unlinks a product from a brand.

#### Get All Products with Brands
```
GET /admin/products-with-brands
```
Returns all products with their linked brands.

### Usage Examples

#### Linking a Product to a Brand
```bash
curl -X POST 'http://localhost:9000/admin/products/prod_123/brands' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-admin-token' \
  --data '{
    "brand_id": "brand_456"
  }'
```

#### Getting a Product's Brands
```bash
curl -X GET 'http://localhost:9000/admin/products/prod_123/brands' \
  -H 'Authorization: Bearer your-admin-token'
```

#### Getting All Products with Brands
```bash
curl -X GET 'http://localhost:9000/admin/products-with-brands' \
  -H 'Authorization: Bearer your-admin-token'
```

### Code Example

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../modules/brand"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const { id: productId } = req.params

  // Get linked brands for a product
  const linkedBrands = await link.list({
    from: {
      [Modules.PRODUCT]: {
        product_id: productId,
      },
    },
    to: {
      [BRAND_MODULE]: {},
    },
  })

  res.json({
    product_id: productId,
    brands: linkedBrands,
  })
}
```