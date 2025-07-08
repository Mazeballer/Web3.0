"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, TrendingDown, Shield, AlertTriangle, CheckCircle } from "lucide-react"

const lendingPools = [
  {
    token: "ETH",
    icon: "⟠",
    apy: 5.2,
    liquidity: 1250000,
    borrowed: 850000,
    maxLoan: 10000,
    collateralRatio: 150,
  },
  {
    token: "USDC",
    icon: "💵",
    apy: 8.5,
    liquidity: 2500000,
    borrowed: 1800000,
    maxLoan: 50000,
    collateralRatio: 120,
  },
  {
    token: "DAI",
    icon: "◈",
    apy: 7.8,
    liquidity: 1800000,
    borrowed: 1200000,
    maxLoan: 25000,
    collateralRatio: 125,
  },
  {
    token: "WBTC",
    icon: "₿",
    apy: 4.8,
    liquidity: 500000,
    borrowed: 320000,
    maxLoan: 5000,
    collateralRatio: 160,
  },
]

export default function BorrowPage() {
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const [selectedPool, setSelectedPool] = useState<(typeof lendingPools)[0] | null>(null)
  const [loanAmount, setLoanAmount] = useState("")
  const [collateralToken, setCollateralToken] = useState("")
  const [loanDuration, setLoanDuration] = useState("")

  const handleLoanRequest = () => {
    if (!loanAmount || !collateralToken || !loanDuration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Loan Request Submitted",
      description: `Your request for ${loanAmount} ${selectedPool?.token} has been submitted for processing.`,
    })

    // Reset form
    setLoanAmount("")
    setCollateralToken("")
    setLoanDuration("")
    setSelectedPool(null)
  }

  if (!isConnected) {
    return (
      <Card className="gradient-card text-center p-12">
        <CardContent>
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet to Borrow</h3>
          <p className="text-muted-foreground">
            Connect your wallet to access borrowing features and view available lending pools
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Borrow Assets
          </h1>
          <p className="text-muted-foreground mt-2">
            Access liquidity by borrowing against your collateral with competitive rates
          </p>
        </div>
      </div>

      {/* Borrowing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Borrow Limit</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$25,000</div>
            <p className="text-xs text-muted-foreground">Based on trust score: 750</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Borrowed</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,500</div>
            <Progress value={50} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available to Borrow</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">$12,500</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>
      </div>

      {/* Lending Pools */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Available Lending Pools</CardTitle>
          <CardDescription>Choose from our available lending pools with competitive rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lendingPools.map((pool) => (
              <Card key={pool.token} className="border border-border/50 hover:border-border transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{pool.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{pool.token}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          APY {pool.apy}%
                        </Badge>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="gradient-primary text-white hover:opacity-90"
                          onClick={() => setSelectedPool(pool)}
                        >
                          Borrow
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Borrow {pool.token}</DialogTitle>
                          <DialogDescription>Request a loan from the {pool.token} lending pool</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                            <div>
                              <div className="text-sm text-muted-foreground">APY</div>
                              <div className="font-semibold">{pool.apy}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Collateral Ratio</div>
                              <div className="font-semibold">{pool.collateralRatio}%</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="amount">Loan Amount</Label>
                              <Input
                                id="amount"
                                placeholder={`Enter ${pool.token} amount`}
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                              />
                            </div>

                            <div>
                              <Label htmlFor="collateral">Collateral Token</Label>
                              <Select value={collateralToken} onValueChange={setCollateralToken}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select collateral" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="eth">ETH</SelectItem>
                                  <SelectItem value="usdc">USDC</SelectItem>
                                  <SelectItem value="dai">DAI</SelectItem>
                                  <SelectItem value="wbtc">WBTC</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="duration">Loan Duration</Label>
                              <Select value={loanDuration} onValueChange={setLoanDuration}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">30 days</SelectItem>
                                  <SelectItem value="60">60 days</SelectItem>
                                  <SelectItem value="90">90 days</SelectItem>
                                  <SelectItem value="180">180 days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {loanAmount && collateralToken && (
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Loan Summary</span>
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
                                  <span>{pool.apy}% APY</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Required Collateral:</span>
                                  <span>
                                    {((Number.parseFloat(loanAmount || "0") * pool.collateralRatio) / 100).toFixed(2)}{" "}
                                    {collateralToken.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={handleLoanRequest}
                            className="w-full gradient-primary text-white hover:opacity-90"
                          >
                            Submit Loan Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Liquidity</span>
                      <span className="font-medium">${pool.liquidity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Borrowed</span>
                      <span className="font-medium">${pool.borrowed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Loan</span>
                      <span className="font-medium">${pool.maxLoan.toLocaleString()}</span>
                    </div>
                    <Progress value={(pool.borrowed / pool.liquidity) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {((pool.borrowed / pool.liquidity) * 100).toFixed(1)}% utilized
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
