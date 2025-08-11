"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useContractWrite } from "wagmi";
import {
  parseEther,
  formatEther,
  decodeEventLog,
  getEventSelector,
  parseAbiItem,
  setupKzg,
} from "viem";
import { BorrowingPoolABI } from "@/lib/BorrowingPoolABI";
import type { PublicClient } from "viem";
import { usePublicClient } from "wagmi";

export default function BorrowPage() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const { toast } = useToast();
  const [lendingPools, setLendingPools] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [collateralRatio, setcollateralRatio] = useState(0);
  const [adjustedInterestRate, setadjustedInterestRate] = useState(0);
  const [updatedInfo, setUpdatedInfo] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [lendingPoolReady, setLendingPoolReady] = useState(false);
  const [creditScoreReady, setCreditScore] = useState(false);
  const [totalBorrowReady, setTotalBorrowReady] = useState(false);
  const client = usePublicClient() as PublicClient;
  const { address } = useAccount();
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchLendingPools() {
      try {
        const res = await fetch("/api/pools/borrow-pools");
        const data = await res.json();
        setLendingPools(data);
        setUpdatedInfo(true);
        setLendingPoolReady(true);
      } catch (error) {
        console.error("Failed to fetch lending pools:", error);
      }
    }

    fetchLendingPools();
  }, [updatedInfo]);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch("/api/credit-score/get");
        const data = await res.json();
        setOverallScore(data.score);
        setUpdatedInfo(true);
        setCreditScore(true);
      } catch (err) {
        console.error("Failed to fetch credit score", err);
      } finally {
        // setScoreLoaded(true);
      }
    };

    fetchScore();
  }, [updatedInfo]);

  useEffect(() => {
    async function fetchBorrowed() {
      const res = await fetch("/api/borrow/total");
      const data = await res.json();
      setTotalBorrowed(data.totalBorrowed);
      setUpdatedInfo(true);
      setTotalBorrowReady(true);
    }

    fetchBorrowed();
  }, [updatedInfo]);

  useEffect(() => {
    if (overallScore >= 700) {
      setcollateralRatio(50); // 🟩 Elite: 50% – 75%
    } else if (overallScore >= 500) {
      setcollateralRatio(75); // 🟨 Trusted: 75% – 100%
    } else if (overallScore >= 300) {
      setcollateralRatio(100); // 🟧 Average: 100%
    } else if (overallScore >= 100) {
      setcollateralRatio(150); // 🟥 Low: 120% – 150%
    } else {
      setcollateralRatio(180); // ⬛ New/Risky: 150% – 200%
    }
  }, [overallScore]);

  useEffect(() => {
    if (overallScore >= 700) {
      setadjustedInterestRate(0.008); // 🟩 Elite: 50% – 75%
    } else if (overallScore >= 500) {
      setadjustedInterestRate(0.01); // 🟨 Trusted: 75% – 100%
    } else if (overallScore >= 300) {
      setadjustedInterestRate(0.013); // 🟧 Average: 100%
    } else if (overallScore >= 100) {
      setadjustedInterestRate(0.016); // 🟥 Low: 120% – 150%
    } else {
      setadjustedInterestRate(0.02); // ⬛ New/Risky: 150% – 200%
    }
  }, [overallScore]);

  function getMaxLoanFromScore(score: number): number {
    if (score >= 700) return 50000;
    if (score >= 500) return 30000;
    if (score >= 300) return 15000;
    if (score >= 100) return 10000;
    return 5000; // for score 0–99
  }

  function getInterestRate(creditScore: number): number {
    if (creditScore >= 700) {
      return 0.008; // 🟩 Elite
    } else if (creditScore >= 500) {
      return 0.01; // 🟨 Trusted
    } else if (creditScore >= 300) {
      return 0.013; // 🟧 Average
    } else if (creditScore >= 100) {
      return 0.016; // 🟥 Low
    } else {
      return 0.02; // ⬛ Risky
    }
  }

  const [selectedPool, setSelectedPool] = useState<
    (typeof lendingPools)[0] | null
  >(null);
  const [loanAmount, setLoanAmount] = useState("");
  const [collateralToken, setCollateralToken] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [totalBorrowed, setTotalBorrowed] = useState(0);

  const { writeContractAsync, isPending } = useContractWrite({
    mutation: {
      onSuccess: () => {
        toast({ title: "Transaction sent" });
      },
      onError: (error: Error) => {
        toast({
          title: "Transaction failed",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const handleLoanRequest = async () => {
    if (!loanAmount || !collateralToken || !loanDuration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (
      parseFloat(loanAmount) > selectedPool?.maxLoan ||
      parseFloat(loanAmount) > getMaxLoanFromScore(overallScore) - totalBorrowed
    ) {
      toast({
        title: "Loan Amount exceeded",
        description: `Please enter a Loan Amount less than ${
          selectedPool?.maxLoan
        } or less than ${(
          getMaxLoanFromScore(overallScore) - totalBorrowed
        ).toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(loanAmount);
      const durationInSeconds = parseInt(loanDuration) * 30 * 24 * 60 * 60;
      const baseInterestRate = selectedPool?.interest_rate;
      const requiredCollateral = (amount * collateralRatio) / 100;

      const contractAddress = process.env
        .NEXT_PUBLIC_LENDING_POOL_ADDRESS as `0x${string}`;

      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: BorrowingPoolABI.abi,
        functionName: "requestLoan",
        args: [
          parseEther(amount.toString()),
          collateralToken.toUpperCase(),
          durationInSeconds,
        ],
        value: parseEther(requiredCollateral.toString()),
      });

      toast({
        title: "Loan Request Submitted",
        description: `Tx hash: ${txHash}`,
      });

      // Optional: wait for confirmation
      const receipt = await client.waitForTransactionReceipt({ hash: txHash });
      console.log("📦 Loan confirmed:", receipt);

      // Decode onchain loanId from event log
      const eventSelector = getEventSelector(
        parseAbiItem(
          "event Borrowed(uint256 loanId, address borrower, uint256 amount, uint256 collateral, string collateralToken, uint256 duration, uint256 startTime)"
        )
      );

      const borrowedLog = receipt.logs.find(
        (log) => log.topics[0] === eventSelector
      );

      if (!borrowedLog) {
        toast({
          title: "No Borrow event found",
          description: "Your contract may not have emitted borrowed",
          variant: "destructive",
        });
        return;
      }

      const raw = decodeEventLog({
        abi: BorrowingPoolABI.abi,
        data: borrowedLog.data,
        topics: borrowedLog.topics,
      });

      const decoded = raw as unknown as {
        args: {
          loanId: bigint;
        };
      };

      const onchainId = Number(decoded.args.loanId);
      console.log("✅ onchain depositId =", onchainId);

      await fetch("/api/borrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          poolToken: selectedPool?.token,
          amount,
          collateralAmount: requiredCollateral,
          collateralAsset: collateralToken,
          baseInterestRate,
          adjustedInterestRate,
          txHash,
          walletAddress: address,
          onchainId,
          loanDuration,
        }),
      });

      // Reset form
      setLoanAmount("");
      setCollateralToken("");
      setLoanDuration("");
      setSelectedPool(null);
      setUpdatedInfo(false);

      if (getMaxLoanFromScore(overallScore) - totalBorrowed) {
        try {
          const res = await fetch("/api/credit-score/over-borrow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (!res.ok) {
            console.error(data.error || "Failed to apply penalty");
            return;
          }

          toast({
            title: "⚠️ Penalty Applied",
            description: `${data.reason} (${data.pointsAwarded} points)`,
            variant: "destructive",
          });
        } catch (err) {
          console.error("Error calling Over-borrowing API:", err);
        }
      }

      try {
        const res = await fetch("/api/credit-score/check-loan-num", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), // no extra params needed if you get user from session
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data.error || "Failed to check high loan frequency");
          return;
        }

        if (data.triggeredPunishment) {
          toast({
            title: "⚠️ Penalty Applied",
            description: `${data.reason} (${Math.abs(
              data.pointsAwarded
            )} points)`,
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error calling high-loan-frequency API:", err);
      }

      setOpenDialog(false);
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="gradient-card text-center p-12">
        <CardContent>
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            Connect Wallet to Borrow
          </h3>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to access borrowing features
          </p>
          <Button
            onClick={() => open()}
            className="gradient-primary text-white"
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!lendingPoolReady && !creditScoreReady && !totalBorrowReady) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Borrow Assets
          </h1>
          <p className="text-muted-foreground mt-2">
            Borrow against your collateral at competitive rates
          </p>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-card">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Your Borrow Limit
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${getMaxLoanFromScore(overallScore).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on trust score: {overallScore}
            </p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Borrowed
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBorrowed.toLocaleString()}
            </div>
            <Progress
              value={totalBorrowed / getMaxLoanFromScore(overallScore)}
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Available to Borrow
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              $
              {(
                getMaxLoanFromScore(overallScore) - totalBorrowed
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>
      </div>

      {/* Lending Pools */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Available Lending Pools</CardTitle>
          <CardDescription>Choose a pool to borrow from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lendingPools.map((pool) => (
              <Card
                key={pool.token}
                className="border hover:border-border/80 transition"
              >
                <CardHeader className="flex justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{pool.icon}</div>

                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{pool.token}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 rounded bg-muted text-white"
                      >
                        Base Interest Rate{" "}
                        {parseFloat(pool.interest_rate).toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <Button
                      size="sm"
                      className="gradient-primary text-white"
                      onClick={() => {
                        setSelectedPool(pool);
                        setOpenDialog(true);
                      }}
                    >
                      Borrow
                    </Button>
                    {openDialog ? (
                      <DialogContent className="sm:max-w-md ">
                        <DialogHeader>
                          <DialogTitle>Borrow {pool.token}</DialogTitle>
                          <DialogDescription>
                            Request a loan from the {pool.token} pool
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Pool info */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Adjusted Interest Rate
                              </p>
                              <p className="font-semibold">
                                {adjustedInterestRate}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Collateral Ratio
                              </p>
                              <p className="font-semibold">
                                {collateralRatio}%
                              </p>
                            </div>
                          </div>

                          {/* Form */}
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="amount">Loan Amount</Label>
                              <Input
                                id="amount"
                                placeholder={`Enter ${pool.token}`}
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="collateral">
                                Collateral Token
                              </Label>
                              <Select
                                value={collateralToken}
                                onValueChange={setCollateralToken}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select collateral" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="go">GO</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="duration">Loan Duration</Label>
                              <Select
                                value={loanDuration}
                                onValueChange={setLoanDuration}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 month</SelectItem>
                                  <SelectItem value="2">2 month</SelectItem>
                                  <SelectItem value="3">3 month</SelectItem>
                                  <SelectItem value="4">4 month</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Summary */}
                          {loanAmount && collateralToken && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">
                                  Loan Summary
                                </span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Loan Amount:</span>
                                  <span>
                                    {loanAmount} {pool.token}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Interest Rate:</span>
                                  <span>{adjustedInterestRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Required Collateral:</span>
                                  <span>
                                    {(
                                      ((parseFloat(loanAmount) || 0) *
                                        collateralRatio) /
                                      100
                                    ).toFixed(2)}{" "}
                                    {collateralToken.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={handleLoanRequest}
                            className="w-full gradient-primary text-white"
                          >
                            Submit Loan Request
                          </Button>
                        </div>
                      </DialogContent>
                    ) : null}
                  </Dialog>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Liquidity</span>
                      <span className="font-medium">
                        ${pool.liquidity.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Borrowed</span>
                      <span className="font-medium">
                        ${pool.borrowed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Loan</span>
                      <span className="font-medium">
                        ${pool.maxLoan.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={(pool.borrowed / pool.maxLoan) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {((pool.borrowed / pool.maxLoan) * 100).toFixed(1)}%
                      utilized
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
