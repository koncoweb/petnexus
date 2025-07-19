@echo off
echo Checking PetNexus Setup Status...
cd petnexus
npx medusa exec ./src/scripts/check-setup.ts
pause 