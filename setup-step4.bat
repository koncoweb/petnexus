@echo off
echo Running Setup Step 4: Restock Orders...
cd petnexus
npx medusa exec ./src/scripts/setup-step4-restock-orders.ts
pause 