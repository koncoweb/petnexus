# Supplier Module

A comprehensive supplier management module for Medusa that handles supplier relationships and business operations.

## Features

- **Supplier Management**: Complete CRUD operations for suppliers
- **Status Management**: Active, inactive, and suspended statuses
- **Contact Information**: Complete contact and address details
- **Business Settings**: Payment terms, tax ID, and business information
- **AI Integration Ready**: Prepared for future AI auto-restock features
- **WhatsApp Integration**: Support for WhatsApp business communication

## Data Models

### Supplier
- Company information (name, contact, address)
- Business details (tax ID, payment terms)
- Status management (active, inactive, suspended)
- AI settings (auto-restock, thresholds)
- Communication channels (email, phone, WhatsApp)

## API Endpoints

### Admin API
- `GET /admin/suppliers` - List all suppliers
- `POST /admin/suppliers` - Create a new supplier
- `GET /admin/suppliers/:id` - Get supplier details
- `PUT /admin/suppliers/:id` - Update supplier
- `DELETE /admin/suppliers/:id` - Delete supplier

### Store API
- `GET /store/suppliers` - List active suppliers
- `GET /store/suppliers/:id` - Get supplier details

## Usage Examples

### Creating a Supplier
```typescript
const supplier = await supplierService.createSuppliers({
  company_name: "ABC Pet Supplies",
  contact_person: "John Doe",
  email: "john@abcpetsupplies.com",
  phone: "+1234567890",
  address: "123 Pet Street",
  city: "Pet City",
  country: "US",
  auto_restock_enabled: true,
  ai_restock_threshold: 15,
})
```

### Getting Active Suppliers
```typescript
const activeSuppliers = await supplierService.getActiveSuppliers()
```

## Installation

1. Add the module to `medusa-config.ts`:
```typescript
modules: [
  {
    resolve: "./src/modules/supplier",
  },
],
```

2. Run migrations:
```bash
npx medusa db:generate supplier
npx medusa db:migrate
```

3. Start the server:
```bash
npm run dev
```

## Future Features

- **Brand Relationships**: Many-to-many supplier-brand relationships
- **Promotional Programs**: Supplier-specific promotional campaigns
- **Order Tracking**: Track orders with suppliers
- **Advanced Analytics**: Supplier performance metrics
- **Automated Ordering**: AI-powered purchase orders 