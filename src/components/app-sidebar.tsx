'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  CreditCard,
  Banknote,
  TrendingUp,
  History,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Borrow', url: '/dashboard/borrow', icon: CreditCard },
  { title: 'Lend', url: '/dashboard/lend', icon: Banknote },
  { title: 'Credit Score', url: '/dashboard/credit-score', icon: TrendingUp },
  { title: 'Loan History', url: '/dashboard/loan-history', icon: History },
];

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">DL</span>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DeFiLend
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="space-y-3">
          {isConnected ? (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Connected Wallet
              </div>
              <div className="text-sm font-mono bg-muted/50 p-2 rounded-md">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnect()}
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => open()}
              className="w-full gradient-primary text-white hover:opacity-90"
            >
              Connect Wallet
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full"
          >
            {mounted &&
              (theme === 'dark' ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              ))}
            {mounted
              ? (theme === 'dark' ? 'Light' : 'Dark') + ' Mode'
              : 'Toggle Theme'}
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
