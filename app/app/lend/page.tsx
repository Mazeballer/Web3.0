"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/hooks/use-toast"
import { Banknote, TrendingUp, Wallet, Plus, Minus, Star } from "lucide-react"

const lendingPools = [
  {
    token: "ETH",
    icon: "⟠",
    apy: 5.2,
    totalDeposited: 1250000,
    yourDeposit: 2.5,
    earned: 0.13,
    rewardPoints: 125,
  },
  {
    token: "USDC",
    icon: "💵",
    apy: 8.5,
    totalDeposited: 2500000,
    yourDeposit: 5000,
    earned: 425,
    rewardPoints: 850,
  },
  {
    token: "DAI",
    icon: "◈",
    apy: 7.8,
    totalDeposited: 1800000,
    yourDeposit: 1500,
    earned: 117,
    rewardPoints: 234,
  },
  {
    token: "WBTC",
    icon: "₿",
    apy: 4.8,
    totalDeposited: 500000,
    yourDeposit: 0.1,
    earned: 0.0048,
    rewardPoints: 48,
  },
]

export default function LendPage() {
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const [selectedPool, setSelectedPool] = useState<(typeof lendingPools)[0] | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("")

  const handleDeposit = () => {
    if (!depositAmount || !selectedToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Deposit Successful",
      description: `Successfully deposited ${depositAmount} ${selectedToken} to the lending pool.`,
    })

    setDepositAmount("")
    setSelectedToken("")
  }

  const handleWithdraw = () => {
    if (!withdrawAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter withdrawal amount",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Withdrawal Successful",
      description: `Successfully withdrew ${withdrawAmount} ${selectedPool?.token} from the lending pool.`,
    })

    setWithdrawAmount("")
    setSelectedPool(null)
  }

  if (!isConnected) {
    return (
      <Card className="gradient-card text-center p-12">
        <CardContent>
          <Banknote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet to Lend</h3>
          <p className="text-muted-foreground">
            Connect your wallet to start earning yield by lending your crypto assets
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalDeposited = lendingPools.reduce(
    (sum, pool) => sum + pool.yourDeposit * (pool.token === "ETH" || pool.token === "WBTC" ? 2000 : 1),
    0,
  )
  const totalEarned = lendingPools.reduce(
    (sum, pool) => sum + pool.earned * (pool.token === "ETH" || pool.token === "WBTC" ? 2000 : 1),
    0,
  )
  const totalRewardPoints = lendingPools.reduce((sum, pool) => sum + pool.rewardPoints, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Lend Assets
          </h1>
          <p className="text-muted-foreground mt-2">
            Earn yield by lending your crypto assets to borrowers with competitive APY rates
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-secondary text-white hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              New Deposit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Deposit Assets</DialogTitle>
              <DialogDescription>Deposit your assets to start earning yield</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="token">Select Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose token to deposit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH - 5.2% APY</SelectItem>
                    <SelectItem value="USDC">USDC - 8.5% APY</SelectItem>
                    <SelectItem value="DAI">DAI - 7.8% APY</SelectItem>
                    <SelectItem value="WBTC">WBTC - 4.8% APY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Deposit Amount</Label>
                <Input
                  id="amount"
                  placeholder="Enter amount to deposit"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              {depositAmount && selectedToken && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Deposit Amount:</span>
                      <span>
                        {depositAmount} {selectedToken}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>APY:</span>
                      <span className="text-emerald-600 font-medium">
                        {selectedToken === "ETH"
                          ? "5.2%"
                          : selectedToken === "USDC"
                            ? "8.5%"
                            : selectedToken === "DAI"
                              ? "7.8%"
                              : "4.8%"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Monthly Earnings:</span>
                      <span className="text-emerald-600 font-medium">
                        {((Number.parseFloat(depositAmount || "0") * 0.08) / 12).toFixed(4)} {selectedToken}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleDeposit} className="w-full gradient-secondary text-white hover:opacity-90">
                Deposit Assets
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeposited.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across 4 pools</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">${totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalRewardPoints}</div>
            <p className="text-xs text-muted-foreground">Loyalty rewards</p>
          </CardContent>
        </Card>
      </div>

      {/* Lending Pools Table */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Your Lending Positions</CardTitle>
          <CardDescription>Overview of your deposits and earnings across different pools</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>APY</TableHead>
                <TableHead>Your Deposit</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Reward Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lendingPools.map((pool) => (
                <TableRow key={pool.token}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pool.icon}</span>
                      <span className="font-medium">{pool.token}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-emerald-600">
                      {pool.apy}%
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {pool.yourDeposit} {pool.token}
                  </TableCell>
                  <TableCell className="text-emerald-600 font-medium">
                    +{pool.earned} {pool.token}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm">{pool.rewardPoints}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedPool(pool)}>
                            <Minus className="h-3 w-3 mr-1" />
                            Withdraw
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Withdraw {pool.token}</DialogTitle>
                            <DialogDescription>
                              Withdraw your deposited {pool.token} from the lending pool
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted/30">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Available to Withdraw:</span>
                                  <span className="font-medium">
                                    {pool.yourDeposit} {pool.token}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Earned Interest:</span>
                                  <span className="text-emerald-600 font-medium">
                                    +{pool.earned} {pool.token}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="withdraw-amount">Withdrawal Amount</Label>
                              <Input
                                id="withdraw-amount"
                                placeholder={`Max: ${pool.yourDeposit} ${pool.token}`}
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                              />
                            </div>

                            <Button onClick={handleWithdraw} className="w-full" variant="outline">
                              Withdraw Assets
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
