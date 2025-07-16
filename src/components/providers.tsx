// src/components/providers.tsx

'use client';

import { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;

const hardhatChain = {
  id: 31337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
      webSocket: [],
    },
  },
  testnet: true,
} as const;

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [hardhatChain] as any,
});

const queryClient = new QueryClient();

createAppKit({
  projectId,
  adapters: [wagmiAdapter],
  networks: [hardhatChain] as any,
  defaultNetwork: hardhatChain as any,
  metadata: {
    name: 'DeFiLend',
    description: 'Decentralized Lending Platform',
    url: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
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
