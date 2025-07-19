Write-Host "Running Complete PetNexus Setup..." -ForegroundColor Cyan

Set-Location petnexus

Write-Host "Step 1: Product Variants..." -ForegroundColor Yellow
npx medusa exec ./src/scripts/setup-step1-variants.ts

Write-Host "Step 2: Inventory Levels..." -ForegroundColor Yellow
npx medusa exec ./src/scripts/setup-step2-inventory.ts

Write-Host "Step 3: Suppliers..." -ForegroundColor Yellow
npx medusa exec ./src/scripts/setup-step3-suppliers.ts

Write-Host "Step 4: Restock Orders..." -ForegroundColor Yellow
npx medusa exec ./src/scripts/setup-step4-restock-orders.ts

Write-Host "Step 5: Smart Restock Analysis..." -ForegroundColor Yellow
npx medusa exec ./src/scripts/setup-step5-smart-restock.ts

Write-Host "Final Check: Setup Status..." -ForegroundColor Yellow
npx medusa exec ./src/scripts/check-setup.ts

Write-Host "Setup Complete!" -ForegroundColor Green 