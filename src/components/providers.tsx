// components/Providers.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia } from '@reown/appkit/networks';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
const wagmiAdapter = new WagmiAdapter({ projectId, networks: [sepolia] });
const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    createAppKit({
      projectId,
      adapters: [wagmiAdapter],
      networks: [sepolia],
      defaultNetwork: sepolia,
      metadata: {
        name: 'DeFiLend',
        description: 'Decentralized Lending Platform',
        url: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
        icons: [],
      },
    });
  }, []);

  return (
    <WagmiConfig config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </WagmiConfig>
  );
}
