# Blockchain Assignment

## Setup

### 1. Installation

```bash
pnpm install
pnpm add -D concurrently
pnpm add -D @types/bcrypt

## 2. Enviroment Variables

DATABASE_URL="postgresql://postgres:12345678@db.pqswcnymtyetoxcddcxq.supabase.co:5432/postgres"
NEXT_PUBLIC_REOWN_PROJECT_ID=32e0d35ed9123bf7197e4f81e2c93c49
GOOGLE_CLIENT_ID=1059053086837-km8t0a82o65dvujhqbgqe510fmvk8hq5.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXTAUTH_SECRET=HnpmyNvXXAwPg8h4JJEVMgw+kIaZ1udhuwccZQOgNQQ=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://pqswcnymtyetoxcddcxq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxc3djbnltdHlldG94Y2RkY3hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc1MzE3NSwiZXhwIjoyMDY2MzI5MTc1fQ.nPgLbu6cOHaMB7WGcbufb7M6kef14SKhV8iIBu_J2gc
NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x5fbdb2315678afecb367f032d93f642f64180aa3

## 3. Prisma (Database)

npx prisma db pull
npx prisma generate

## 4. Local Hardhat

1. Install Hardhat
npm install --save-dev hardhat

2. Open hardhat.config.ts and comment out line 2
// import "./scripts/deploy-viem";

3. Compile and start the Hardhat node
npx hardhat compile
npx hardhat node

4. npx hardhat deploy-lendingPool --network localhost

## 5. Start the App
pnpm dev
```
