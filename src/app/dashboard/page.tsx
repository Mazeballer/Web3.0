"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";

import {
  Wallet as WalletIcon,
  TrendingUp,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
} from "lucide-react";

import { useAppKit } from "@reown/appkit/react";
import { useAccount, useBalance } from "wagmi";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  // appkit hook
  const { open } = useAppKit();
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const [symbol, setSymbol] = useState(balanceData?.symbol);
  useEffect(() => {
    if (balanceData?.symbol) {
      setSymbol(balanceData.symbol);
    }
  }, [balanceData?.symbol]);

  // format balance to 4 decimals
  const balance = balanceData
    ? parseFloat(balanceData.formatted).toFixed(4)
    : "0.0000";

  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [collateralRatio, setcollateralRatio] = useState(0);

  useEffect(() => {
    const checkOverdue = async () => {
      try {
        const res = await fetch("/api/borrow/check-borrow-status", {
          method: "POST",
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("❌ Error:", data.error);
          return;
        }

        console.log(✅ ${data.updated} loans marked as late.);
      } catch (error) {
        console.error("Error checking overdue loans:", error);
      }
    };

    checkOverdue();
  }, []);

add this in your dashboard
  useEffect(() => {
    const fetchCreditScore = async () => {
      try {
        const res = await fetch("/api/credit-score/get", {
          method: "GET",
          credentials: "include", // 👈 send cookies/session
        });

        if (!res.ok) throw new Error("Failed to fetch credit score");

        const data = await res.json();
        setCreditScore(data.score);
      } catch (error) {
        console.error("Error fetching credit score:", error);
        setCreditScore(0);
      }
    };

    async function fetchBorrowed() {
      const res = await fetch("/api/borrow/total");
      const data = await res.json();
      setTotalBorrowed(data.totalBorrowed);
    }

    fetchBorrowed();
    fetchCreditScore();
  }, []);

  function getInterestRate(creditScore: number): number {
    if (creditScore >= 700) {
      return 0.8; // 🟩 Elite
    } else if (creditScore >= 500) {
      return 1; // 🟨 Trusted
    } else if (creditScore >= 300) {
      return 1.3; // 🟧 Average
    } else if (creditScore >= 100) {
      return 1.6; // 🟥 Low
    } else {
      return 2; // ⬛ Risky
    }
  }

  function getEligibility(creditScore: number): number {
    if (creditScore >= 700) {
      return 100; // 🟩 Elite
    } else if (creditScore >= 500) {
      return 75; // 🟨 Trusted
    } else if (creditScore >= 300) {
      return 50; // 🟧 Average
    } else if (creditScore >= 100) {
      return 25; // 🟥 Low
    } else {
      return 20; // ⬛ Risky
    }
  }

  function getMaxLoanFromScore(score: number): number {
    if (score >= 700) return 50000;
    if (score >= 500) return 30000;
    if (score >= 300) return 15000;
    if (score >= 100) return 10000;
    return 5000; // for score 0–99
  }

  useEffect(() => {
    if (creditScore == null) {
      setcollateralRatio(180); // ⬛ New/Risky: 150% – 200%
    } else if (creditScore >= 700) {
      setcollateralRatio(50); // 🟩 Elite: 50% – 75%
    } else if (creditScore >= 500) {
      setcollateralRatio(75); // 🟨 Trusted: 75% – 100%
    } else if (creditScore >= 300) {
      setcollateralRatio(100); // 🟧 Average: 100%
    } else if (creditScore >= 100) {
      setcollateralRatio(150); // 🟥 Low: 120% – 150%
    } else {
      setcollateralRatio(180); // ⬛ New/Risky: 150% – 200%
    }
  }, [creditScore]);

  const scoreCategory =
    creditScore == null
      ? "New"
      : creditScore >= 700 && creditScore <= 850
      ? "Elite"
      : creditScore >= 500 && creditScore <= 699
      ? "Trusted"
      : creditScore >= 300 && creditScore <= 499
      ? "Average"
      : creditScore >= 100
      ? "Low"
      : "New";

  type Totals = {
    totalDeposited: string;
    totalInterest: string;
    totalBalance: string;
  };

  const { data: totalLentData } = useQuery<Totals>({
    queryKey: ["totalLent", userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/deposits/total?email=${userEmail}`);
      if (!res.ok) throw new Error("Failed to load totals");
      return (await res.json()) as Totals;
    },
    enabled: !!userEmail,
  });

  useEffect(() => {
    const fetchLoanHistory = async () => {
      try {
        const res = await fetch("/api/loan-history/get-history-list");
        const data = await res.json();
        // sort by date if your API returns a date field

        setLoanHistory(data.slice(0, 3)); // top 3 most recent
      } catch (err) {
        console.error("Failed to fetch loan history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanHistory();
  }, []);

  const userData = {
    creditScore: creditScore ?? "Loading..",
    creditCategory: scoreCategory,
    totalBorrowed: totalBorrowed,
    totalLent: totalLentData?.totalDeposited,
    eligibilityScore: getEligibility(creditScore ?? 0),
    maxLoan: getMaxLoanFromScore(creditScore ?? 0),
    interestRate: getInterestRate(creditScore ?? 0),
    collateral: collateralRatio,
  };

  useEffect(() => {
    const checkOverdue = async () => {
      try {
        const res = await fetch("/api/borrow/check-borrow-status", {
          method: "POST",
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("❌ Error:", data.error);
          return;
        }

        console.log(`✅ ${data.updated} loans marked as late.`);
      } catch (error) {
        console.error("Error checking overdue loans:", error);
      }
    };

    checkOverdue();
  }, []);

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

            {/* Credit Score */}
            <Card className="gradient-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Credit Score
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {userData.creditScore}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress
                    value={userData.creditScore / 10}
                    className="flex-1"
                  />
                  <Badge variant="secondary">{userData.creditCategory}</Badge>
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
                  ${userData.totalBorrowed.toLocaleString()}
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
                  ${userData.totalLent?.toLocaleString()}
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
                    {userData.eligibilityScore}%
                  </span>
                </div>
                <Progress value={userData.eligibilityScore} className="h-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold">
                      ${userData.maxLoan.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Max Loan Amount
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold">
                      {userData.interestRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Your Interest Rate
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold">
                      {userData.collateral}%
                    </div>
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
                Recent Loan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : loanHistory.length > 0 ? (
                <div className="space-y-4">
                  {loanHistory.map((loan, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        {loan.type === "lend" ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        ) : loan.type === "borrow" ? (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-blue-500" />
                        )}
                        <div>
                          <div className="font-medium capitalize">
                            {loan.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {loan.amount} {loan.token}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {loan.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No recent loans found.
                </p>
              )}
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
