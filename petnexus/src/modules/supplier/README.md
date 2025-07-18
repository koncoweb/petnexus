# Supplier Module Documentation

## Overview

The Supplier Module is a custom Medusa module that manages supplier data, restock orders, and related business logic. This module demonstrates best practices for creating, managing, and integrating custom modules in Medusa.

## Module Structure

```
src/modules/supplier/
├── index.ts              # Module registration and exports
├── service.ts            # Business logic and CRUD operations
├── models/               # Data models
│   ├── supplier.ts       # Supplier entity
│   ├── restock-order.ts  # Restock order entity
│   └── restock-order-item.ts # Restock order items
├── migrations/           # Database migrations
└── README.md            # This documentation
```

## Data Models

### Supplier Model
```typescript
const Supplier = model.define("supplier", {
  id: model.id().primaryKey(),
  name: model.text(),
  email: model.text(),
  phone: model.text(),
  address: model.text(),
  status: model.enum(["active", "inactive", "suspended"]).default("active"),
  contact_person: model.text(),
  payment_terms: model.text(),
  notes: model.text(),
})
```

### RestockOrder Model
```typescript
const RestockOrder = model.define("restock_order", {
  id: model.id().primaryKey(),
  supplier_id: model.text(),
  status: model.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending"),
  total_items: model.number().default(0),
  total_cost: model.number().default(0),
  currency_code: model.text().default("USD"),
  notes: model.text(),
  expected_delivery_date: model.text(),
  actual_delivery_date: model.text(),
})
```

### RestockOrderItem Model
```typescript
const RestockOrderItem = model.define("restock_order_item", {
  id: model.id().primaryKey(),
  restock_order_id: model.text(),
  product_id: model.text(),
  variant_id: model.text(),
  quantity: model.number(),
  unit_cost: model.number(),
  total_cost: model.number(),
  notes: model.text(),
})
```

## Service Methods

### Supplier Management
- `getSupplierWithDetails(supplierId: string)` - Retrieve supplier with full details
- `getActiveSuppliers()` - Get all active suppliers
- `updateSupplierStatus(supplierId: string, status)` - Update supplier status

### Restock Order Management
- `createRestockOrder(data)` - Create new restock order
- `getSupplierRestockOrders(supplierId: string, status?)` - Get supplier's restock orders
- `updateRestockOrderStatus(orderId: string, status)` - Update order status
- `createRestockOrderItem(data)` - Add item to restock order
- `getRestockOrderItems(orderId: string)` - Get items for an order

### Analytics
- `getSupplierAnalytics(supplierId: string)` - Get supplier performance metrics

## API Routes

### Admin Routes
- `GET /admin/suppliers` - List all suppliers
- `POST /admin/suppliers` - Create new supplier
- `GET /admin/suppliers/:id` - Get supplier details
- `PUT /admin/suppliers/:id` - Update supplier
- `DELETE /admin/suppliers/:id` - Delete supplier
- `GET /admin/suppliers/:id/restock-orders` - Get supplier's restock orders
- `POST /admin/suppliers/:id/restock-orders` - Create restock order for supplier

### Restock Orders Routes
- `GET /admin/restock-orders` - List all restock orders
- `POST /admin/restock-orders` - Create new restock order
- `GET /admin/restock-orders/:id` - Get restock order details
- `PUT /admin/restock-orders/:id` - Update restock order
- `DELETE /admin/restock-orders/:id` - Delete restock order

## Module Registration

The module is registered in `medusa-config.ts`:

```typescript
modules: [
  {
    resolve: "./src/modules/supplier",
  },
]
```

## Module Constants

```typescript
export const SUPPLIER_MODULE = "supplier"
```

## Service Resolution

To use the supplier service in other parts of the application:

```typescript
import { SUPPLIER_MODULE } from "../modules/supplier"

// In API routes
const supplierService = req.scope.resolve(SUPPLIER_MODULE)

// In workflows
const supplierService = container.resolve(SUPPLIER_MODULE)
```

## Database Migrations

Migrations are automatically generated when models are modified:

```bash
npx medusa db:generate supplier
npx medusa db:migrate
```

## Error Handling

The module implements comprehensive error handling:

1. **Service Level**: Try-catch blocks with meaningful error messages
2. **API Level**: Proper HTTP status codes and error responses
3. **Validation**: Zod schemas for input validation

## Best Practices

### 1. Model Design
- Use snake_case for table names
- Include proper relationships between models
- Use enums for status fields
- Set appropriate defaults

### 2. Service Implementation
- Extend `MedusaService` for automatic CRUD operations
- Add custom business logic methods
- Implement proper error handling
- Use TypeScript for type safety

### 3. API Design
- Follow RESTful conventions
- Implement proper validation
- Return consistent response formats
- Handle errors gracefully

### 4. Module Integration
- Use module constants for service resolution
- Register modules in medusa-config.ts
- Export linkable entities for cross-module relationships

## Workflow Integration

To integrate with Medusa workflows:

```typescript
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { SUPPLIER_MODULE } from "../modules/supplier"
import SupplierModuleService from "../modules/supplier/service"

const createRestockOrderStep = createStep(
  "create-restock-order",
  async (input, { container }) => {
    const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
    const order = await supplierService.createRestockOrder(input)
    return new StepResponse(order, order)
  },
  async (order, { container }) => {
    const supplierService: SupplierModuleService = container.resolve(SUPPLIER_MODULE)
    await supplierService.deleteRestockOrders(order.id)
  }
)

export const createRestockOrderWorkflow = createWorkflow(
  "create-restock-order",
  (input) => {
    const order = createRestockOrderStep(input)
    return new WorkflowResponse(order)
  }
)
```

## Testing

### Unit Tests
- Test service methods
- Test model validations
- Test error scenarios

### Integration Tests
- Test API endpoints
- Test database operations
- Test workflow execution

## Deployment

1. Ensure all migrations are applied
2. Verify module registration in medusa-config.ts
3. Test all API endpoints
4. Monitor error logs

## Troubleshooting

### Common Issues

1. **Service Resolution Errors**
   - Verify module is registered in medusa-config.ts
   - Check module constant usage
   - Ensure proper import paths

2. **Database Errors**
   - Run migrations: `npx medusa db:migrate`
   - Check model definitions
   - Verify foreign key relationships

3. **API Errors**
   - Check request validation
   - Verify authentication/authorization
   - Review error logs

### Debug Steps

1. Check server logs for detailed error messages
2. Verify database schema matches model definitions
3. Test service methods directly
4. Validate API request/response formats

## Future Enhancements

1. **Integration with Product Module**
   - Link suppliers to products
   - Track supplier-specific product data

2. **Inventory Management**
   - Automatic inventory updates on restock
   - Low stock alerts

3. **Reporting**
   - Supplier performance reports
   - Cost analysis
   - Delivery tracking

4. **Notifications**
   - Email notifications for status changes
   - Webhook integrations

## Related Documentation

- [Medusa Modules Guide](https://docs.medusajs.com/learn/fundamentals/modules)
- [Data Models](https://docs.medusajs.com/learn/fundamentals/data-models)
- [Workflows](https://docs.medusajs.com/learn/fundamentals/workflows)
- [API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes)
- [Service Factory Reference](https://docs.medusajs.com/resources/service-factory-reference) 