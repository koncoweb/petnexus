@echo off
echo Running Setup Step 3: Suppliers...
cd petnexus
npx medusa exec ./src/scripts/setup-step3-suppliers.ts
pause 