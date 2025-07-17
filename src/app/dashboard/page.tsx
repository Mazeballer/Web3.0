'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import {
  Wallet as WalletIcon,
  TrendingUp,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
} from 'lucide-react';

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useBalance } from 'wagmi';

export default function Dashboard() {
  // appkit hook
  const { open } = useAppKit();

  // wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const symbol = balanceData?.symbol ?? 'ETH';

  // format balance to 4 decimals
  const balance = balanceData
    ? parseFloat(balanceData.formatted).toFixed(4)
    : '0.0000';

  const mockData = {
    trustScore: 750,
    totalBorrowed: 12500,
    totalLent: 8750,
    eligibilityScore: 85,
    recentActivity: [
      { type: 'lend', amount: 1000, token: 'USDC', date: '2024-01-15' },
      { type: 'borrow', amount: 500, token: 'ETH', date: '2024-01-14' },
      { type: 'repay', amount: 250, token: 'DAI', date: '2024-01-13' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-card p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to CreDiFi
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            The next-generation decentralized lending platform. Borrow and lend
            crypto assets with dynamic interest rates based on your trust score.
          </p>

          {!isConnected && (
            <Button
              onClick={() => open()}
              size="lg"
              className="gradient-primary text-white hover:opacity-90 animate-glow"
            >
              <WalletIcon className="h-5 w-5 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {isConnected ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Wallet Balance */}
            <Card className="gradient-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Wallet Balance
                </CardTitle>
                <WalletIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balance} {symbol}
                </div>
                <p className="text-xs text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </CardContent>
            </Card>

            {/* Trust Score */}
            <Card className="gradient-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Trust Score
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {mockData.trustScore}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress
                    value={mockData.trustScore / 10}
                    className="flex-1"
                  />
                  <Badge variant="secondary">Excellent</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Total Borrowed */}
            <Card className="gradient-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Borrowed
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${mockData.totalBorrowed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across 3 active loans
                </p>
              </CardContent>
            </Card>

            {/* Total Lent */}
            <Card className="gradient-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Lent
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${mockData.totalLent.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Earning 8.5% APY
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Loan Eligibility */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Loan Eligibility
              </CardTitle>
              <CardDescription>
                Your current borrowing capacity based on trust score and
                collateral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Eligibility Score</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {mockData.eligibilityScore}%
                  </span>
                </div>
                <Progress value={mockData.eligibilityScore} className="h-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold">$25,000</div>
                    <div className="text-sm text-muted-foreground">
                      Max Loan Amount
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold">4.5%</div>
                    <div className="text-sm text-muted-foreground">
                      Your Interest Rate
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold">120%</div>
                    <div className="text-sm text-muted-foreground">
                      Collateral Ratio
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentActivity.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {act.type === 'lend' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      ) : act.type === 'borrow' ? (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-blue-500" />
                      )}
                      <div>
                        <div className="font-medium capitalize">{act.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {act.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {act.amount} {act.token}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {act.type === 'lend'
                          ? 'Completed'
                          : act.type === 'borrow'
                          ? 'Active'
                          : 'Paid'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="gradient-card text-center p-12">
          <CardContent>
            <WalletIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Connect your MetaMask wallet to access lending and borrowing
              features
            </p>
            <Button
              onClick={() => open()}
              className="gradient-primary text-white hover:opacity-90"
            >
              <WalletIcon className="h-5 w-5 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
