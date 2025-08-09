"use client";

import { useState, useEffect } from "react";
import { addMonths, differenceInDays, format } from "date-fns";
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import LendingPoolABI from "@/abis/LendingBorrowingPool.json";
const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_LENDING_POOL_ADDRESS as `0x${string}`;
import { usePublicClient, useWalletClient } from "wagmi";
import { toast } from "@/hooks/use-toast";
import { formatEther } from "viem";

export default function RepaymentsPage() {
  const [totalOutstanding, setTotalOutstanding] = useState<number | null>(null);
  const [activeLoanCount, setActiveLoanCount] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [loansAtRisk, setLoansAtRisk] = useState<number>(0);
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [payingId, setPayingId] = useState<number | null>(null);
  const [creditImpact, setCreditImpact] = useState<number | null>(null);
  const [onTimePayments, setOnTimePayments] = useState<number>(0);
  const [latePayments, setLatePayments] = useState<number>(0);
  const [overdueActive, setOverdueActive] = useState<number>(0);
  const [payingAll, setPayingAll] = useState(false);

  // Fetch overall stats
  useEffect(() => {
    fetch("/api/repayment/fetch?summary=true")
      .then((res) => res.json())
      .then((data) => {
        setTotalOutstanding(data.totalOutstanding || 0);
        setActiveLoanCount(data.activeLoanCount || 0);
        if (typeof data.creditImpact === "number")
          setCreditImpact(data.creditImpact);
        if (typeof data.onTimePayments === "number")
          setOnTimePayments(data.onTimePayments);
        if (typeof data.latePayments === "number")
          setLatePayments(data.latePayments); // ← add
        if (typeof data.overdueActive === "number")
          setOverdueActive(data.overdueActive); // ← add
      })
      .catch(() => {
        setTotalOutstanding(0);
        setActiveLoanCount(0);
        setCreditImpact(0);
        setOnTimePayments(0);
        setLatePayments(0); // ← add
        setOverdueActive(0); // ← add
      });
  }, []);

  // Fetch all loans for risk analysis
  useEffect(() => {
    fetch("/api/repayment/fetch")
      .then((res) => res.json())
      .then((data) => {
        setLoans(Array.isArray(data) ? data : []);
      })
      .catch(() => setLoans([]));
  }, []);

  useEffect(() => {
    if (!Array.isArray(loans) || loans.length === 0) {
      setLoansAtRisk(0);
      return;
    }

    const now = new Date();
    let count = 0;

    loans.forEach((loan) => {
      if (!loan.borrowed_at || !loan.borrow_duration) return;
      const borrowedAt = new Date(loan.borrowed_at);
      const durationMonths = Number(loan.borrow_duration) || 0;
      // Calculate due date
      const dueDate = new Date(borrowedAt);
      dueDate.setMonth(dueDate.getMonth() + durationMonths);

      if (now > dueDate) count += 1;
    });

    setLoansAtRisk(count);
  }, [loans]);

  function getPaymentStatus(dueDate: Date) {
    const now = new Date();
    if (now > dueDate) return "overdue";
    const diff = differenceInDays(dueDate, now);
    if (diff <= 30) return "due-soon";
    return "upcoming";
  }

  const upcomingPaymentsSafe = loans
    .filter((l) => l.status !== "completed") // keep
    .map((loan) => {
      const borrowedAt = new Date(loan.borrowed_at);
      const durationMonths = Number(loan.borrow_duration) || 0;
      const dueDate = addMonths(borrowedAt, durationMonths);

      const repayWei = loan.repayWei ?? loan.repay_amount_wei ?? null;

      return {
        id: loan.id,
        onChainLoanId: loan.onChainLoanId ?? loan.id,
        borrower: loan.borrower,
        asset: loan.collateral_asset || "??",
        amountEth: String(loan.totalDue ?? loan.amount),
        repayWei: loan.repayWei,
        collateralWei: loan.collateralWei,
        dueDate,
        status: getPaymentStatus(dueDate),
        rawStatus: loan.status,
      };
    })
    .filter(
      (p) =>
        // only “active/late” loans AND with a valid dueDate
        (p.rawStatus === "active" || p.rawStatus === "late") &&
        p.dueDate instanceof Date &&
        !isNaN(p.dueDate.getTime()) &&
        ["overdue", "due-soon", "upcoming"].includes(p.status)
    )
    .sort((a, b) => {
      const order = { overdue: 0, "due-soon": 1, upcoming: 2 } as const;
      if (order[a.status] !== order[b.status])
        return (order as any)[a.status] - (order as any)[b.status];
      return a.dueDate.getTime() - b.dueDate.getTime(); // now safe
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </Badge>
        );
      case "due-soon":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Due Soon
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Upcoming
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handlePayment = async (loan: any): Promise<boolean> => {
    if (!CONTRACT_ADDRESS) {
      toast({
        title: "Error",
        description: "Lending Pool contract not configured",
      });
      return false;
    }
    if (!isConnected || !address) {
      toast({ title: "Connect your wallet first." });
      open();
      return false;
    }
    if (
      loan.borrower &&
      address.toLowerCase() !== loan.borrower.toLowerCase()
    ) {
      toast({
        title: "Wrong wallet",
        description: `Switch to ${loan.borrower.slice(
          0,
          6
        )}…${loan.borrower.slice(-4)}.`,
      });
      return false;
    }
    if (!loan.repayWei) {
      toast({
        title: "Missing amount",
        description: "No repay amount for this loan.",
      });
      return false;
    }

    let repayWei: bigint;
    let collateralWei: bigint;
    try {
      repayWei = BigInt(loan.repayWei);
      collateralWei = BigInt(loan.collateralWei ?? 0);
    } catch {
      toast({
        title: "Amount error",
        description: "Invalid repayment values.",
      });
      return false;
    }
    const valueToSend = repayWei; // only principal+interest

    let t:
      | { id: string; update: (p: any) => void; dismiss: () => void }
      | undefined;

    try {
      setPayingId(loan.id);

      // Preflight
      const sim = await publicClient!.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: LendingPoolABI.abi,
        functionName: "repayLoanBypass",
        args: [
          loan.onChainLoanId ?? loan.id,
          repayWei,
          loan.borrower as `0x${string}`,
          collateralWei,
        ],
        value: valueToSend,
        account: address as `0x${string}`,
      });

      // Signature prompt
      t = toast({
        title: "Waiting for signature",
        description: "Please confirm the transaction in your wallet…",
      });

      let txHash: `0x${string}`;
      try {
        txHash = await walletClient!.writeContract(sim.request);
        t.update?.({
          id: t.id,
          title: "Transaction sent",
          description: "Waiting for confirmation…",
        });
      } catch (err: any) {
        const m = String(err?.shortMessage || err?.message || "");
        const userDenied = err?.code === 4001 || /denied|rejected/i.test(m);
        t.update?.({
          id: t.id,
          title: userDenied ? "Transaction cancelled" : "Transaction failed",
          description: m || "Unknown error",
        });
        return false;
      }

      await publicClient!.waitForTransactionReceipt({ hash: txHash });

      // Persist repayment
      await fetch("/api/repayment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId: loan.id, txHash }),
      });

      // Optimistic UI
      setLoans((prev) =>
        prev.map((l) =>
          l.id === loan.id
            ? { ...l, status: "completed", repaid_at: new Date().toISOString() }
            : l
        )
      );

      // Refresh lists + summary (include credit fields if you added them)
      const [loansRes, sumRes] = await Promise.all([
        fetch("/api/repayment/fetch"),
        fetch("/api/repayment/fetch?summary=true"),
      ]);
      const freshLoans = await loansRes.json();
      const sum = await sumRes.json();
      setLoans(Array.isArray(freshLoans) ? freshLoans : []);
      setTotalOutstanding(sum.totalOutstanding ?? 0);
      setActiveLoanCount(sum.activeLoanCount ?? 0);
      if (typeof sum.creditImpact === "number")
        setCreditImpact(sum.creditImpact);
      if (typeof sum.onTimePayments === "number")
        setOnTimePayments(sum.onTimePayments);
      if (typeof sum.latePayments === "number")
        setLatePayments(sum.latePayments);
      if (typeof sum.overdueActive === "number")
        setOverdueActive(sum.overdueActive);

      t.update?.({
        id: t.id,
        title: "Repayment successful",
        description: "Your collateral has been released.",
      });

      return true; // ✅ important
    } catch (e: any) {
      const msg = String(e?.shortMessage || e?.message || "Transaction failed");
      const userDenied = e?.code === 4001 || /denied|rejected/i.test(msg);
      if (t) {
        t.update?.({
          id: t.id,
          title: userDenied ? "Transaction cancelled" : "Failed",
          description: msg,
        });
      } else {
        toast({
          title: userDenied ? "Transaction cancelled" : "Failed",
          description: msg,
        });
      }
      return false; // ✅ propagate failure
    } finally {
      setPayingId(null);
    }
  };

  const activeToPay = upcomingPaymentsSafe.filter(
    (l) => l.rawStatus === "active" && l.repayWei
  );

  // BigInt sum in wei
  const totalRepayWei = activeToPay.reduce<bigint>(
    (acc, l) => acc + BigInt(l.repayWei ?? 0),
    0n
  );
  const totalRepayEth = Number(formatEther(totalRepayWei)); // for display only

  const handlePayAllActive = async () => {
    if (!activeToPay.length) {
      toast({ title: "Nothing to pay", description: "No active loans found." });
      return;
    }
    setPayingAll(true);

    let ok = 0,
      fail = 0;
    for (const loan of activeToPay) {
      const success = await handlePayment({
        ...loan,
        onChainLoanId: loan.onChainLoanId ?? loan.on_chain_loan_id,
        repayWei: loan.repayWei ?? loan.repay_amount_wei,
        amountEth: loan.amountEth ?? loan.amount,
        borrower: loan.borrower,
        collateralWei: loan.collateralWei,
      });
      if (success) ok++;
      else fail++;
    }

    setPayingAll(false);
    toast({
      title: "Batch complete",
      description: `Paid ${ok}/${activeToPay.length} loans${
        fail ? ` • ${fail} failed` : ""
      }.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loan Repayments</h1>
        <p className="text-muted-foreground">
          Manage your outstanding loans and make payments
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outstanding
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOutstanding !== null
                ? `$${totalOutstanding.toLocaleString()}`
                : "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {activeLoanCount}{" "}
              {activeLoanCount === 1 ? "loan" : "loans"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loans at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loansAtRisk}</div>
            <p className="text-xs text-muted-foreground">
              {loansAtRisk === 1
                ? "1 loan is overdue"
                : `${loansAtRisk} loans are overdue`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={
                "text-2xl font-bold " +
                (creditImpact !== null && creditImpact < 0
                  ? "text-red-600"
                  : "text-green-600")
              }
            >
              {creditImpact === null
                ? "—"
                : creditImpact > 0
                ? `+${creditImpact}`
                : `${creditImpact}`}
            </div>
            <p className="text-xs text-muted-foreground">
              On-time: {onTimePayments} • Late: {latePayments} • Overdue:{" "}
              {overdueActive}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Payments due in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingPaymentsSafe.length === 0 && (
              <div className="text-muted-foreground text-sm">
                No upcoming payments.
              </div>
            )}

            {upcomingPaymentsSafe.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {payment.asset.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {payment.asset} Loan #
                      {payment.onChainLoanId ??
                        payment.on_chain_loan_id ??
                        payment.id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Due {format(payment.dueDate, "yyyy-MM-dd")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {payment.amountEth
                        ? `${payment.amountEth} ETH`
                        : `$${payment.amount}`}
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>

                  <Button
                    size="sm"
                    className="gradient-primary text-white"
                    disabled={
                      payingId === payment.id || payment.rawStatus !== "active"
                    }
                    onClick={() =>
                      handlePayment({
                        ...payment,
                        onChainLoanId:
                          payment.onChainLoanId ?? payment.on_chain_loan_id,
                        repayWei: payment.repayWei ?? payment.repay_amount_wei,
                        amountEth: payment.amountEth ?? payment.amount,
                        borrower: payment.borrower, // <-- pass borrower
                        collateralWei: payment.collateralWei,
                      })
                    }
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Loans (reusing upcomingPaymentsSafe data) */}
      <Card>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
          <CardDescription>
            Detailed view of all your outstanding loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingPaymentsSafe.length === 0 && (
              <div className="text-muted-foreground text-sm">
                No active loans.
              </div>
            )}

            {upcomingPaymentsSafe.map((loan) => {
              const daysLeft = differenceInDays(loan.dueDate, new Date());
              return (
                <div key={loan.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold uppercase">
                        {loan.asset?.slice(0, 2) ?? "AS"}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">
                          {loan.asset} Loan #{loan.onChainLoanId ?? loan.id}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>Due {format(loan.dueDate, "yyyy-MM-dd")}</span>
                          <span>•</span>
                          <span>
                            {loan.status === "overdue"
                              ? "Overdue"
                              : daysLeft <= 0
                              ? "Due today"
                              : `${daysLeft} day${
                                  daysLeft === 1 ? "" : "s"
                                } left`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {loan.amountEth ? `${loan.amountEth} ETH` : "—"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Amount due
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                      <div className="font-semibold">
                        {getStatusBadge(loan.status)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Borrower
                      </div>
                      <div className="font-semibold">
                        {loan.borrower
                          ? `${loan.borrower.slice(0, 6)}…${loan.borrower.slice(
                              -4
                            )}`
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Repay (wei)
                      </div>
                      <div className="font-semibold">
                        {loan.repayWei ? loan.repayWei.toString() : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Collateral (wei)
                      </div>
                      <div className="font-semibold">
                        {loan.collateralWei
                          ? loan.collateralWei.toString()
                          : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {loan.rawStatus === "active"
                        ? "Active"
                        : loan.rawStatus === "late"
                        ? "Late"
                        : loan.rawStatus}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Placeholder “details” action if you want to wire a modal later
                          console.log("View details for", loan.id);
                        }}
                      >
                        View Details
                      </Button>

                      <Button
                        size="sm"
                        className="gradient-primary text-white"
                        disabled={
                          payingId === loan.id || loan.rawStatus !== "active"
                        }
                        onClick={() =>
                          handlePayment({
                            ...loan,
                            onChainLoanId:
                              loan.onChainLoanId ?? loan.on_chain_loan_id,
                            repayWei: loan.repayWei ?? loan.repay_amount_wei,
                            amountEth: loan.amountEth ?? loan.amount,
                            borrower: loan.borrower,
                            collateralWei: loan.collateralWei,
                          })
                        }
                      >
                        Pay Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              className="gradient-primary text-white"
              disabled={!activeToPay.length || payingAll}
              onClick={handlePayAllActive}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {payingAll ? "Paying…" : "Pay All Active"}
            </Button>

            <div className="text-sm text-muted-foreground">
              Total needed:&nbsp;
              <span className="font-semibold">
                {activeToPay.length
                  ? `${totalRepayEth.toLocaleString()} ETH`
                  : "—"}
              </span>
            </div>

            <Button variant="outline">
              <TrendingDown className="h-4 w-4 mr-2" />
              Set Up Auto-Pay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
