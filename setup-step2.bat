@echo off
echo Running Setup Step 2: Inventory Levels...
cd petnexus
npx medusa exec ./src/scripts/setup-step2-inventory.ts
pause 