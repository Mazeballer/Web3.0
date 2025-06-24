# Decentralized Lending PWA

This repository contains **ChainTrust** (also known as **DeFiLend**), a Progressive Web App for decentralized lending and borrowing built with Next.js, Prisma, and Supabase.

## 🚀 Getting Started

Follow these steps to get the project up and running locally after cloning:

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/defi-lend.git
   cd defi-lend
   ```

2. **Install dependencies**

   * Make sure you have Node.js (v18+) and pnpm installed globally:

     ```bash
     npm install -g pnpm
     ```
   * Install project dependencies:

     ```bash
     pnpm install
     ```

3. **Configure environment variables**

   * Copy the example file and update with your values:

     ```bash
     cp .env.example .env
     ```
   * In `.env`, set your Supabase connection string:

     ```env
     DATABASE_URL="postgresql://postgres:<PASSWORD>@<HOST>.supabase.co:5432/postgres"
     ```

4. **Prisma setup**

   * Generate the Prisma client:

     ```bash
     pnpm prisma generate
     ```
   * Push the schema to your Supabase database:

     ```bash
     pnpm prisma db push
     ```

5. **Run in development mode**

   ```bash
   pnpm dev
   ```

   * Open [http://localhost:3000](http://localhost:3000) in your browser.
   * Service worker and PWA features are disabled in dev by default.

6. **Test PWA in production mode**

   ```bash
   pnpm build
   pnpm start
   ```

   * Visit [http://localhost:3000](http://localhost:3000) and open DevTools → Application to verify:

     * Manifest is loaded
     * Service worker is registered (`/sw.js`)
     * App is installable and offline-capable

## 🔧 Project Structure

```text
├── app/               # Next.js App Router pages and layouts
├── components/        # React components (UI, theme, wallet-provider)
├── prisma/            # Prisma schema and migrations
├── public/            # Static assets, PWA icons, manifest.json, sw.js
├── styles/            # Global CSS (globals.css)
├── next.config.mjs    # Next.js configuration with PWA support
├── package.json
├── pnpm-lock.yaml
└── .env.example       # Example environment variables
```

## 📦 Scripts

* `pnpm dev`       — Start the development server
* `pnpm build`     — Build the application for production
* `pnpm start`     — Start the production server
* `pnpm prisma generate` — Generate Prisma client
* `pnpm prisma db push`   — Push Prisma schema to the database

## 🤝 Contributing

Feel free to open issues or submit pull requests. Please follow the existing code style and include tests where applicable.

---

*Happy hacking!*
