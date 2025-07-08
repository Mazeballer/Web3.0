'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const { toast } = useToast();

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);

          // Mock balance for demo
          setBalance('2.45');

          toast({
            title: 'Wallet Connected',
            description: `Connected to ${accounts[0].slice(
              0,
              6
            )}...${accounts[0].slice(-4)}`,
          });
        }
      } catch (error) {
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect wallet',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to continue',
        variant: 'destructive',
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
