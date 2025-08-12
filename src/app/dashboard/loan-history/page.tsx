"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

export default function LoanHistoryPage() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredHistory = loanHistory.filter((loan) => {
    const matchesSearch =
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.token.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || loan.status === statusFilter;
    const matchesType = typeFilter === "all" || loan.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
            Completed
          </Badge>
        );
      // case "paid-on-time":
      //   return (
      //     <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
      //       Paid on Time
      //     </Badge>
      //   );
      case "late":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
            Late
          </Badge>
        );
      // case "defaulted":
      //   return (
      //     <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
      //       Defaulted
      //     </Badge>
      //   );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
      // case "paid-on-time":
      //   return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "late":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      // case "defaulted":
      //   return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  useEffect(() => {
    const fetchLoanHistory = async () => {
      try {
        const res = await fetch("/api/loan-history/get-history-list");
        const data = await res.json();
        setLoanHistory(data);
      } catch (err) {
        console.error("Failed to fetch loan history", err);
      } finally {
        setLoading(false); // stop loading
      }
    };

    fetchLoanHistory();
  }, []);

  // if (!isConnected) {
  //   return (
  //     <Card className="gradient-card text-center p-12">
  //       <CardContent>
  //         <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
  //         <h3 className="text-xl font-semibold mb-2">
  //           Connect Wallet to View History
  //         </h3>
  //         <p className="text-muted-foreground">
  //           Connect your wallet to view your complete lending and borrowing
  //           history
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  const totalLoans = loanHistory.length;
  const activeLoans = loanHistory.filter(
    (loan) => loan.status === "active" || loan.status === "late"
  ).length;
  const completedLoans = loanHistory.filter(
    (loan) => loan.status === "completed"
  ).length;
  const totalBorrowed = loanHistory
    .filter((loan) => loan.type === "borrow")
    .reduce((sum, loan) => sum + loan.amount, 0);
  const totalLent = loanHistory
    .filter((loan) => loan.type === "lend")
    .reduce((sum, loan) => sum + loan.amount, 0);

  const Spinner = () => (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return loading ? (
    <Spinner />
  ) : (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loan History
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete history of your lending and borrowing activities
        </p>
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
            <div className="text-2xl font-bold text-blue-600">
              {activeLoans}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Borrowed
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBorrowed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lend</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalLent.toLocaleString()}
            </div>
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
                {/* <SelectItem value="paid-on-time">Paid on Time</SelectItem> */}
                <SelectItem value="late">Late</SelectItem>
                {/* <SelectItem value="defaulted">Defaulted</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loan History Table */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Detailed view of all your lending and borrowing transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Accumulated APY</TableHead>
                    {/* <TableHead>Duration</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-mono text-sm">
                        {loan.id}
                      </TableCell>
                      <TableCell className="capitalize">{loan.type}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {loan.amount} {loan.token}
                        </div>
                      </TableCell>
                      <TableCell>{loan.account}</TableCell>
                      <TableCell>
                        {loan.type === "lend" ? (
                          <div className="space-y-1 text-xs">
                            <div className="text-emerald-400">{loan.apy}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        {loan.type === "borrow" &&
                          (loan.status === "active" ||
                            loan.status === "late") && (
                            <Button size="sm" variant="outline">
                              Repay
                            </Button>
                          )}
                        {loan.type === "lend" && loan.status === "active" && (
                          <Button size="sm" variant="outline">
                            Withdraw
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
  );

  // return (

  // );
}
