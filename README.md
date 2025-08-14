# Blockchain Assignment

## Setup

### 1. Installation

```bash
pnpm install
pnpm add -D concurrently
pnpm add -D @types/bcrypt

## 2. Enviroment Variables (Create .env file)

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

4. Uncomment line 2
   import "./scripts/deploy-viem";

5. this is also to get NEXT_PUBLIC_LENDING_POOL_ADDRESS
npx hardhat deploy-lendingPool --network localhost

## 5. Add Local Blockchain in Metamask

1. Add Custom Network

2. Fill in Custom Network Details

- Network Name: hardhat
- Default RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency symbol: GO

3. Import account with Private Key

- Copy Private Key generated from 'npx hardhat node' terminal

## 6. Start the App (In Web3.0 Front-End Folder)

pnpm dev
```

## System Key Features

### 1. Register and Login Validation

```bash
Credit Score Rules for Register:

---
______________________________________________________________________
| Title                        | Description                | Points |
| ---------------------------- | -------------------------- | ------ |
| 🧍‍♂ Verified identity (KYC)  | Full KYC profile completed | +20    |
----------------------------------------------------------------------
---
```

### 2. Lend Logic Based on Credit Score

```bash
_Lending and Withdrawing Rule:_
Users must use the _same wallet address_ that was used to deposit in order to withdraw the loans.

---
_________________________________________
| Credit Score Range | Tier       | APY |
| ------------------ | ---------- | --- |
| 700 – 850          | 🟩 Elite   | 2%  |
| 500 – 699          | 🟨 Trusted | 4%  |
| 300 – 499          | 🟧 Average | 6%  |
| 100 – 299          | 🟥 Low     | 8%  |
| 0 – 99             | ⬛ Risky   | 10% |
------------------------------------------
---

Formula to Calculate APY:
The contract uses **simple (non-compounding) interest** with APY base in **credit score**.

### Terms
- **Principal (P):** your deposit amount.
- **APY (as a decimal):** `apyBps / 10,000`
  (e.g. **200 bps** = **0.02** = **2%**)
- **Time-in-years:**
  - using **seconds**: `elapsedSeconds / 31,536,000` (365 days), or
  - using **months**: `months / 12`, or
  - using **days**: `days / 365`

### Formulas
**Interest = Principal × APY × Time-in-years**
**Payout   = Principal + Interest**

### Quick examples (use month to calculate)
- **1,000 at 2% for 6 months** → years = 0.5
  `interest = 1000 × 0.02 × 0.5 = 10` → **payout = 1010**
- **1,000 at 2% for 3 months** → years = 0.25
  `interest = 1000 × 0.02 × 0.25 = 5` → **payout = 1005**
---
_________________________________________________________________________________________________________________________
| Title                                        | Description                                                   | Points |
| -------------------------------------------- | ------------------------------------------------------------- | ------ |
| 💹 Lending funds ≥ 30 days                   | Funds locked for lending pool without withdrawal for 30+ days | +15    |
| 🏦 Consistent lending over 3 months          | Minimum monthly lending activity for 3 months                 | +60    |
| 🔐 No withdrawal from lending pool ≥ 60 days | Passive, long-term lending support                            | +35    |
| 💸 Early withdrawal from lending pool        | User removes funds from the pool before 30 days               | -20    |
-------------------------------------------------------------------------------------------------------------------------
---
```

### 3. Borrow and Repayment Logic Based on Credit Score

```bash
_Repayment Rule:_
Users must use the _same wallet address_ that was used to borrow the loan in order to make repayments.

---
________________________________________________________________________________________________________________
| Credit Score Range | Tier       | Collateral Ratio (%) | Adjusted Interest Rate (per month) | Max Loan (USD) |
| ------------------ | ---------- | -------------------- | ---------------------------------- | -------------- |
| 700 – 850          | 🟩 Elite   | 150                  | 0.8%                               | 50,000         |
| 500 – 699          | 🟨 Trusted | 160                  | 1.0%                               | 30,000         |
| 300 – 499          | 🟧 Average | 175                  | 1.3%                               | 15,000         |
| 100 – 299          | 🟥 Low     | 190                  | 1.6%                               | 10,000         |
| 0 – 99             | ⬛ Risky   | 200                  | 2.0%                               | 5,000          |
----------------------------------------------------------------------------------------------------------------
---

Formula to Calculate Total Payment:
Total Payment= Total Amount + (Total Amount×Interest Rate) × Duration

Where:
Total Amount = the original loan principal
Interest Rate = monthly interest rate (e.g., 0.01 for 1%)
Duration = loan term in months

Credit Score Rules for Borrow and Repayment:

---
____________________________________________________________________________________________
| Title                         | Description                                     | Points |
| ----------------------------- | ----------------------------------------------- | ------  |
| 🕒 On-time loan repayment     | Per loan paid on or before due date             | +20    |
| 🧮 3 Consecutive good loans   | No late repayment for 3 loans in a row          | +20    |
| ⌛ Late payment               | Missed due date, within grace period            | -20    |
| ❌ Missed repayment > 30 days | Considered default or major delay               | -60    |
| 🔁 High loan frequency        | More than 2 loans within 30 days                | -40    |
| ⚠ Over-borrowing              | Borrowed more than 90% of assigned credit limit | -25    |
--------------------------------------------------------------------------------------------
---
```
