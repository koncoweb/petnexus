@echo off
echo Running Setup Step 1: Product Variants...
cd petnexus
npx medusa exec ./src/scripts/setup-step1-variants.ts
pause 