@echo off
echo Running Setup Step 5: Smart Restock Analysis...
cd petnexus
npx medusa exec ./src/scripts/setup-step5-smart-restock.ts
pause 