# Supplier Admin Widgets

This directory contains admin widgets for supplier management and restock order handling in the Medusa Admin dashboard.

## Widgets Overview

### 1. Supplier Overview Widget (`supplier-overview.tsx`)

**Location**: Dashboard (after main content)
**Purpose**: Provides a comprehensive overview of supplier statistics and quick actions

**Features**:
- Total suppliers count
- Active suppliers count with progress bar
- Pending restock orders count
- Quick action buttons for common tasks
- Recent supplier activity list
- Direct navigation to supplier management

**Usage**:
- Displays on the main dashboard
- Shows real-time supplier statistics
- Provides quick access to supplier management functions

### 2. Product Supplier Widget (`product-supplier.tsx`)

**Location**: Product Details Sidebar (right side)
**Purpose**: Manages supplier assignments for individual products

**Features**:
- Display current supplier information
- Link/unlink products to suppliers
- Supplier status badges
- Quick actions to view supplier details
- Access to restock orders for the supplier

**Usage**:
- Appears on product detail pages
- Allows admins to assign suppliers to products
- Shows supplier contact information and status

### 3. Restock Orders Widget (`restock-orders.tsx`)

**Location**: Order List (after order list)
**Purpose**: Manages restock orders and their lifecycle

**Features**:
- Filter restock orders by status
- Status management (pending → confirmed → shipped → received)
- Order details table
- Quick status updates
- Order tracking and management

**Usage**:
- Displays on the orders list page
- Allows admins to manage restock order workflow
- Provides status filtering and bulk actions

## Widget Configuration

Each widget uses the `defineWidgetConfig` function to specify its injection zone:

```typescript
export const config = defineWidgetConfig({
  zone: "zone.name.here",
})
```

### Available Zones Used:

- `dashboard.after` - After main dashboard content
- `product.details.side.after` - Right sidebar of product details
- `order.list.after` - After order list content

## API Integration

The widgets integrate with the following API endpoints:

### Supplier Management
- `GET /admin/suppliers` - List all suppliers
- `GET /admin/suppliers/:id` - Get supplier details
- `POST /admin/suppliers` - Create new supplier
- `PATCH /admin/suppliers/:id` - Update supplier

### Product-Supplier Links
- `GET /admin/products/:id?fields=+supplier.*` - Get product with supplier
- `POST /admin/products/:id/supplier` - Link product to supplier
- `DELETE /admin/products/:id/supplier` - Unlink product from supplier

### Restock Orders
- `GET /admin/restock-orders` - List restock orders
- `GET /admin/restock-orders/:id` - Get restock order details
- `POST /admin/restock-orders` - Create new restock order
- `PATCH /admin/restock-orders/:id` - Update restock order status

## Data Flow

1. **Supplier Overview Widget**:
   - Fetches supplier statistics on load
   - Displays real-time data
   - Provides navigation to detailed views

2. **Product Supplier Widget**:
   - Loads current product supplier on mount
   - Fetches available suppliers for dropdown
   - Handles linking/unlinking with optimistic updates

3. **Restock Orders Widget**:
   - Loads orders based on status filter
   - Handles status updates with mutations
   - Refreshes data after successful operations

## Styling and UI Components

All widgets use Medusa UI components for consistent styling:

- `Container` - Main widget container
- `Heading` - Section headers
- `Text` - Text content with size variants
- `Button` - Action buttons with variants
- `Badge` - Status indicators
- `Select` - Dropdown selections
- `Table` - Data tables
- `Card` - Content cards (when available)

## Error Handling

Widgets include comprehensive error handling:

- Loading states for async operations
- Error messages for failed API calls
- Fallback UI for empty states
- Optimistic updates with rollback on failure

## Future Enhancements

Planned improvements for the widgets:

1. **Real-time Updates**: WebSocket integration for live data
2. **Bulk Operations**: Multi-select and bulk actions
3. **Advanced Filtering**: Date ranges, supplier types, etc.
4. **Export Functionality**: CSV/PDF export of data
5. **AI Integration**: Smart restock suggestions
6. **WhatsApp Integration**: Direct supplier communication

## Testing

To test the widgets:

1. Start the Medusa server: `npm run dev`
2. Navigate to the admin dashboard: `http://localhost:9000/app`
3. Check each widget appears in its designated zone
4. Test functionality with sample data
5. Verify API integrations work correctly

## Troubleshooting

Common issues and solutions:

1. **Widget not appearing**: Check zone configuration and module loading
2. **API errors**: Verify API routes are implemented and accessible
3. **Styling issues**: Ensure Medusa UI components are properly imported
4. **Data not loading**: Check network requests and API responses

## Contributing

When adding new widgets:

1. Follow the existing widget structure
2. Use Medusa UI components for consistency
3. Include proper TypeScript types
4. Add comprehensive error handling
5. Update this documentation
6. Test thoroughly before deployment 