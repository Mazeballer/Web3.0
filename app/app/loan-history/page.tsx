"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useWallet } from "@/components/wallet-provider"
import { History, Search, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const loanHistory = [
  {
    id: "L001",
    type: "borrow",
    amount: 5000,
    token: "USDC",
    collateral: 2.5,
    collateralToken: "ETH",
    apy: 8.5,
    duration: 90,
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    status: "active",
    repaid: 2500,
    remaining: 2500,
  },
  {
    id: "L002",
    type: "lend",
    amount: 1000,
    token: "DAI",
    apy: 7.8,
    duration: 60,
    startDate: "2024-01-10",
    endDate: "2024-03-10",
    status: "completed",
    earned: 78,
  },
  {
    id: "L003",
    type: "borrow",
    amount: 0.5,
    token: "ETH",
    collateral: 1200,
    collateralToken: "USDC",
    apy: 5.2,
    duration: 30,
    startDate: "2024-01-05",
    endDate: "2024-02-05",
    status: "paid-on-time",
    repaid: 0.5,
    remaining: 0,
  },
  {
    id: "L004",
    type: "lend",
    amount: 2500,
    token: "USDC",
    apy: 8.5,
    duration: 120,
    startDate: "2023-12-20",
    endDate: "2024-04-20",
    status: "active",
    earned: 212.5,
  },
  {
    id: "L005",
    type: "borrow",
    amount: 800,
    token: "DAI",
    collateral: 0.6,
    collateralToken: "ETH",
    apy: 7.8,
    duration: 45,
    startDate: "2023-12-01",
    endDate: "2024-01-15",
    status: "late",
    repaid: 600,
    remaining: 200,
  },
  {
    id: "L006",
    type: "lend",
    amount: 1500,
    token: "ETH",
    apy: 5.2,
    duration: 180,
    startDate: "2023-11-15",
    endDate: "2024-05-15",
    status: "active",
    earned: 39,
  },
]

export default function LoanHistoryPage() {
  const { isConnected } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredHistory = loanHistory.filter((loan) => {
    const matchesSearch =
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.token.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter
    const matchesType = typeFilter === "all" || loan.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Active</Badge>
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Completed</Badge>
      case "paid-on-time":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Paid on Time</Badge>
      case "late":
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Late</Badge>
      case "defaulted":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Defaulted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
      case "paid-on-time":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "late":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "defaulted":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (!isConnected) {
    return (
      <Card className="gradient-card text-center p-12">
        <CardContent>
          <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet to View History</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view your complete lending and borrowing history
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalLoans = loanHistory.length
  const activeLoans = loanHistory.filter((loan) => loan.status === "active").length
  const completedLoans = loanHistory.filter(
    (loan) => loan.status === "completed" || loan.status === "paid-on-time",
  ).length
  const totalBorrowed = loanHistory.filter((loan) => loan.type === "borrow").reduce((sum, loan) => sum + loan.amount, 0)
  const totalLent = loanHistory.filter((loan) => loan.type === "lend").reduce((sum, loan) => sum + loan.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loan History
        </h1>
        <p className="text-muted-foreground mt-2">Complete history of your lending and borrowing activities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoans}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeLoans}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBorrowed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalLent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by loan ID or token..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="borrow">Borrow</SelectItem>
                <SelectItem value="lend">Lend</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paid-on-time">Paid on Time</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loan History Table */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Detailed view of all your lending and borrowing transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>APY</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-mono text-sm">{loan.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {loan.type === "borrow" ? (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        )}
                        <span className="capitalize">{loan.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {loan.amount} {loan.token}
                      </div>
                      {loan.collateral && (
                        <div className="text-xs text-muted-foreground">
                          Collateral: {loan.collateral} {loan.collateralToken}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{loan.apy}%</Badge>
                    </TableCell>
                    <TableCell>{loan.duration} days</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(loan.status)}
                        {getStatusBadge(loan.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {loan.type === "borrow" && loan.status === "active" && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            Repaid: {loan.repaid}/{loan.amount} {loan.token}
                          </div>
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${(loan.repaid / loan.amount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {loan.type === "lend" && loan.earned && (
                        <div className="text-xs">
                          <span className="text-emerald-600 font-medium">
                            +{loan.earned} {loan.token}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {loan.status === "active" && (
                        <Button size="sm" variant="outline">
                          {loan.type === "borrow" ? "Repay" : "Withdraw"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No loans found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "You haven't made any loans yet. Start by borrowing or lending assets."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
