@echo off
echo Running Complete PetNexus Setup...
cd petnexus
npx medusa exec ./src/scripts/setup-all.ts
pause 