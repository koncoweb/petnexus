# Supplier Management UI Routes

This directory contains the React components for the supplier management interface in the Medusa Admin dashboard.

## 📁 File Structure

```
src/admin/routes/suppliers/
├── index.tsx                    # Main suppliers list page
├── [id]/
│   ├── index.tsx               # Supplier detail page
│   ├── edit/
│   │   └── index.tsx           # Edit supplier form
│   └── restock-orders/
│       └── index.tsx           # Restock orders management
└── new/
    └── index.tsx               # Create new supplier form
```

## 🚀 Features

### Suppliers List Page (`/a/suppliers`)
- **Search & Filter**: Search by company name, filter by status
- **Statistics Dashboard**: Shows total, active, auto-restock enabled, and suspended suppliers
- **Data Table**: Displays supplier information with actions
- **Pagination**: Supports paginated results
- **Quick Actions**: View, edit, and delete suppliers
- **Sidebar Navigation**: Appears in admin sidebar with icon

### Supplier Detail Page (`/a/suppliers/[id]`)
- **Complete Information**: Shows all supplier details
- **Organized Sections**: Basic info, address, business info, restock settings
- **Action Buttons**: Edit supplier and view restock orders
- **Status Indicators**: Visual status badges
- **Navigation Breadcrumbs**: Clear navigation path

### Create Supplier Form (`/a/suppliers/new`)
- **Comprehensive Form**: All supplier fields with validation
- **Auto-restock Settings**: Toggle and threshold configuration
- **Address Management**: Complete address information
- **Business Details**: Tax ID, payment terms, status
- **Form Validation**: Real-time validation with error messages

### Edit Supplier Form (`/a/suppliers/[id]/edit`)
- **Pre-populated Form**: Loads existing supplier data
- **Update Capabilities**: Modify any supplier field
- **Validation**: Ensures data integrity
- **Auto-save Indicators**: Shows save progress

### Restock Orders Page (`/a/suppliers/[id]/restock-orders`)
- **Order Management**: View and manage restock orders
- **Status Workflow**: Update order status (pending → confirmed → shipped → delivered)
- **Order Statistics**: Total, pending, shipped, delivered counts
- **Quick Actions**: View order details and update status
- **Filtering**: Filter orders by status

## 🎨 UI Components Used

- **Container**: Main layout wrapper
- **Heading**: Page and section titles
- **Text**: Content display
- **Button**: Actions and navigation
- **Badge**: Status indicators
- **Table**: Data display
- **Input**: Form fields
- **Select**: Dropdown selections
- **Textarea**: Multi-line text input
- **Checkbox**: Boolean options
- **Divider**: Visual separation

## 🔧 API Integration

### Endpoints Used
- `GET /admin/suppliers` - List suppliers with filters
- `POST /admin/suppliers` - Create new supplier
- `GET /admin/suppliers/[id]` - Get supplier details
- `PUT /admin/suppliers/[id]` - Update supplier
- `DELETE /admin/suppliers/[id]` - Delete supplier
- `GET /admin/suppliers/[id]/restock-orders` - List restock orders
- `PUT /admin/suppliers/[id]/restock-orders/[orderId]` - Update order status

### Data Flow
1. **Tanstack Query**: Manages API state and caching
2. **React Router**: Handles navigation between pages
3. **Form Validation**: Zod schemas ensure data integrity
4. **Error Handling**: Graceful error states and user feedback

## 📊 Data Structure

### Supplier Object
```typescript
type Supplier = {
  id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  tax_id: string
  payment_terms: string
  status: "active" | "inactive" | "suspended"
  notes: string
  website: string
  whatsapp_number: string
  auto_restock_enabled: boolean
  ai_restock_threshold: number
  created_at: string
  updated_at: string
}
```

### Restock Order Object
```typescript
type RestockOrder = {
  id: string
  supplier_id: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  currency_code: string
  notes: string
  expected_delivery_date: string
  created_at: string
  updated_at: string
  items: RestockOrderItem[]
}
```

## 🎯 User Experience

### Navigation Flow
1. **List View** → Browse all suppliers with search/filter
2. **Create** → Add new supplier with comprehensive form
3. **Detail View** → View complete supplier information
4. **Edit** → Modify existing supplier data
5. **Restock Orders** → Manage supplier restock orders
6. **Delete** → Remove supplier with confirmation

### Responsive Design
- **Mobile**: Stacked layouts, touch-friendly buttons
- **Tablet**: Optimized grid layouts
- **Desktop**: Full-featured interface with side-by-side sections

### Loading States
- **Skeleton Loaders**: For data fetching
- **Progress Indicators**: For form submissions
- **Error Boundaries**: Graceful error handling

## 🔒 Security & Validation

### Form Validation
- **Required Fields**: Company name, email
- **Email Format**: Valid email validation
- **Number Ranges**: AI threshold minimum values
- **Status Options**: Predefined status enum

### Data Sanitization
- **Input Cleaning**: Remove extra whitespace
- **Type Conversion**: Proper number handling
- **XSS Prevention**: Safe content rendering

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create new supplier with all fields
- [ ] Edit existing supplier information
- [ ] Search suppliers by company name
- [ ] Filter suppliers by status
- [ ] Navigate between all pages
- [ ] Test responsive design
- [ ] Verify form validation
- [ ] Test error handling
- [ ] Test restock order management
- [ ] Verify status workflow

### Automated Testing
Run the test script to verify API functionality:
```bash
npx ts-node ./src/scripts/test-supplier-ui.ts
```

## 🚀 Deployment

### Build Process
1. **TypeScript Compilation**: Ensures type safety
2. **Bundle Optimization**: Minimizes bundle size
3. **Asset Optimization**: Compresses images and fonts

### Environment Configuration
- **API Base URL**: Configured for different environments
- **Feature Flags**: Enable/disable specific features
- **Error Reporting**: Integration with monitoring tools

## 📈 Performance

### Optimization Strategies
- **Code Splitting**: Lazy load routes
- **Memoization**: Prevent unnecessary re-renders
- **Caching**: Tanstack Query for API responses
- **Bundle Analysis**: Monitor bundle size

### Monitoring
- **Page Load Times**: Track performance metrics
- **Error Rates**: Monitor for issues
- **User Interactions**: Analyze usage patterns

## 🔄 Future Enhancements

### Planned Features
- **Bulk Operations**: Select multiple suppliers
- **Advanced Filters**: Date ranges, custom criteria
- **Export Functionality**: CSV/Excel export
- **Supplier Analytics**: Performance metrics
- **Integration Hooks**: Third-party system connections
- **AI Auto-restock**: Automated restock order creation
- **WhatsApp Integration**: Direct communication with suppliers

### Technical Improvements
- **Virtual Scrolling**: For large supplier lists
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Service worker caching
- **Accessibility**: WCAG compliance improvements

## 📚 Related Documentation

- [Medusa Admin Widgets](../widgets/README.md)
- [Supplier Module](../../modules/supplier/README.md)
- [API Routes](../../api/admin/suppliers/README.md)
- [Medusa Framework Documentation](https://docs.medusajs.com/) 