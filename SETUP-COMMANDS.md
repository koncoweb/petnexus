# PetNexus Setup Commands - PowerShell Guide

## 🚀 Quick Start

### From Root Folder (medusa)

#### Using npm scripts (Recommended)
```powershell
# Development
npm run dev:backend

# Setup Steps
npm run setup-step1
npm run setup-step2
npm run setup-step3
npm run setup-step4
npm run setup-step5

# Check Status
npm run check-setup

# Run All Setup
npm run setup-all
```

#### Using Batch Files (Double-click)
- `dev-backend.bat` - Start development server
- `setup-step1.bat` - Create product variants
- `setup-step2.bat` - Setup inventory levels
- `setup-step3.bat` - Create suppliers
- `setup-step4.bat` - Create restock orders
- `setup-step5.bat` - Generate smart restock analysis
- `check-setup.bat` - Check setup status
- `setup-all.bat` - Run all setup steps

#### Using PowerShell Scripts
```powershell
# Development
.\dev-backend.ps1

# Individual Steps
.\setup-step1.ps1
.\setup-step2.ps1
.\setup-step3.ps1
.\setup-step4.ps1
.\setup-step5.ps1

# All Steps
.\setup-all.ps1
```

#### Using VS Code Tasks
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select the desired task:
   - Dev Backend
   - Setup Step 1 - Product Variants
   - Setup Step 2 - Inventory
   - Setup Step 3 - Suppliers
   - Setup Step 4 - Restock Orders
   - Setup Step 5 - Smart Restock
   - Check Setup Status
   - Setup All Steps

## 📋 Setup Steps Overview

### Step 1: Product Variants
- Creates pet products with multiple variants
- Sets up options (Size, Flavor, Type, Color)
- Assigns prices and SKUs
- Links to sales channels

### Step 2: Inventory Levels
- Creates inventory levels for all product variants
- Sets up stock quantities
- Configures inventory management

### Step 3: Suppliers
- Creates supplier records
- Sets up contact information
- Configures payment terms
- Creates supplier promotions

### Step 4: Restock Orders
- Creates restock order records
- Links suppliers to products
- Sets up order status and quantities

### Step 5: Smart Restock Analysis
- Generates AI-powered restock recommendations
- Creates smart restock analysis records
- Sets up automated restock workflows

## 🔧 Troubleshooting

### PowerShell Execution Policy
If you get execution policy errors, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Permission Issues
Run PowerShell as Administrator if needed.

### Path Issues
Make sure you're in the root folder (`medusa`) when running commands.

## 📁 File Structure
```
medusa/
├── package.json (root scripts)
├── dev-backend.bat
├── setup-step1.bat
├── setup-step2.bat
├── setup-step3.bat
├── setup-step4.bat
├── setup-step5.bat
├── check-setup.bat
├── setup-all.bat
├── dev-backend.ps1
├── setup-step1.ps1
├── setup-all.ps1
├── .vscode/
│   └── tasks.json
└── petnexus/
    └── src/scripts/
        ├── setup-step1-variants.ts
        ├── setup-step2-inventory.ts
        ├── setup-step3-suppliers.ts
        ├── setup-step4-restock-orders.ts
        ├── setup-step5-smart-restock.ts
        └── check-setup.ts
```

## ✅ Verification

After running setup, verify with:
```powershell
npm run check-setup
```

This will show:
- Products with variants
- Inventory levels
- Suppliers
- Restock orders
- Smart restock analysis 