"use client";

import { ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
const wagmiAdapter = new WagmiAdapter({ projectId, networks: [sepolia] });
const queryClient = new QueryClient();

// Initialize AppKit immediately when this module loads
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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <WagmiConfig config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </WagmiConfig>
    </SessionProvider>
  );
}
