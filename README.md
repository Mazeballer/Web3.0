# Web3.0 (ChainTrust / DeFiLend) - Decentralized Lending PWA

Welcome to **Web3.0**, a Progressive Web App for transparent, peer‑to‑peer lending and borrowing built with Next.js, Prisma, and Supabase.

## 🚀 Getting Started

These instructions will get your colleagues up and running quickly after cloning the repo.

### 1. Clone the Repository

```bash
git clone https://github.com/Mazeballer/Web3.0.git
cd Web3.0
```

### 2. Install Dependencies

Make sure you have **Node.js (v18+)** and **pnpm** installed globally:

```bash
npm install -g pnpm
```

Then, from the project root:

```bash
pnpm install
```

### 3. Environment Variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

In `.env`, set your Supabase direct connection string:

```env
DATABASE_URL="postgresql://postgres:<PASSWORD>@<HOST>.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://<PROJECT_REF>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<ANON_KEY>"
```

### 4. Prisma Setup

Generate the Prisma client and push the schema to Supabase:

```bash
pnpm prisma generate
pnpm prisma db push
```

### 5. Development

Start the development server (PWA features disabled in dev mode):

```bash
pnpm dev
```

Open your browser at [http://localhost:3000](http://localhost:3000).

### 6. Production Preview (PWA Enabled)

Build and run in production mode to test offline support and installability:

```bash
pnpm build
pnpm start
```

Then visit [http://localhost:3000](http://localhost:3000) and verify in DevTools → Application:

* Manifest is loaded
* Service worker (`/sw.js`) is registered
* App is installable and works offline

---

## 🗂️ Project Structure

```text
├── app/                Next.js App Router pages & layouts
├── components/         React components (UI, theme, wallet-provider)
├── prisma/             Prisma schema & migrations
├── public/             Static assets, PWA icons, manifest.json, sw.js
├── styles/             Global CSS (globals.css)
├── next.config.mjs     Next.js config with PWA support
├── package.json
├── pnpm-lock.yaml
├── .env.example        Example environment variables
└── README.md           This file
```

## 📦 Available Scripts

* `pnpm dev`               — Start the development server
* `pnpm build`             — Build for production
* `pnpm start`             — Run the production server
* `pnpm prisma generate`   — Generate Prisma client
* `pnpm prisma db push`    — Sync schema to Supabase

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m "feat: Add ..."`
4. Push to your branch: `git push origin feature/YourFeature`
5. Open a Pull Request and describe your changes.

---

*Happy building!*
