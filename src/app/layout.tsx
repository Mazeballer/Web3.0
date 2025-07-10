import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { createAppKit } from "@reown/appkit/react"; // Add the AppKit import
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

// Ensure createAppKit is initialized at the root
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
const wagmiAdapter = new WagmiAdapter({ projectId, networks: [sepolia] });

createAppKit({
  projectId,
  adapters: [wagmiAdapter],
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata: {
    name: "DeFiLend",
    description: "Decentralized Lending Platform",
    url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    icons: [],
  },
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
