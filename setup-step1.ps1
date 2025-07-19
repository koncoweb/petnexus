Write-Host "Running Setup Step 1: Product Variants..." -ForegroundColor Yellow
Set-Location petnexus
npx medusa exec ./src/scripts/setup-step1-variants.ts 