'use client';

import { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

// Mock data for active loans
const activeLoans = [
  {
    id: '1',
    asset: 'USDS',
    principal: 5.0,
    borrowed: 3500,
    currentDebt: 3675,
    interestRate: 8.5,
    dueDate: '2024-01-15',
    healthFactor: 1.8,
    collateralValue: 6650,
    minPayment: 245,
    status: 'healthy',
  },
  {
    id: '2',
    asset: 'USDT',
    principal: 0.15,
    borrowed: 6200,
    currentDebt: 6510,
    interestRate: 7.2,
    dueDate: '2024-01-20',
    healthFactor: 1.2,
    collateralValue: 7812,
    minPayment: 325,
    status: 'moderate',
  },
  {
    id: '3',
    asset: 'USDC',
    principal: 2000,
    borrowed: 1800,
    currentDebt: 1890,
    interestRate: 12.0,
    dueDate: '2024-01-12',
    healthFactor: 0.9,
    collateralValue: 1701,
    minPayment: 189,
    status: 'at-risk',
  },
];

const upcomingPayments = [
  {
    id: '3',
    asset: 'USDC',
    amount: 189,
    dueDate: '2024-01-12',
    status: 'overdue',
  },
  {
    id: '1',
    asset: 'USDS',
    amount: 245,
    dueDate: '2024-01-15',
    status: 'due-soon',
  },
  {
    id: '2',
    asset: 'USDT',
    amount: 325,
    dueDate: '2024-01-20',
    status: 'upcoming',
  },
];

export default function RepaymentsPage() {
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('minimum');

  const totalOutstanding = activeLoans.reduce(
    (sum, loan) => sum + loan.currentDebt,
    0
  );
  const totalMinimumDue = activeLoans.reduce(
    (sum, loan) => sum + loan.minPayment,
    0
  );
  const loansAtRisk = activeLoans.filter(
    (loan) => loan.healthFactor < 1.5
  ).length;

  const getHealthColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return 'text-green-600';
    if (healthFactor >= 1.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </Badge>
        );
      case 'due-soon':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Due Soon
          </Badge>
        );
      case 'upcoming':
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

  const handlePayment = () => {
    // Handle payment logic here
    console.log(
      `Processing payment of $${paymentAmount} for loan ${selectedLoan?.id}`
    );
    setSelectedLoan(null);
    setPaymentAmount('');
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
              ${totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {activeLoans.length} loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minimum Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMinimumDue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
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
              Health factor {'<'} 1.5
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+15</div>
            <p className="text-xs text-muted-foreground">On-time payments</p>
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
            {upcomingPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {payment.asset.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium">{payment.asset} Loan</div>
                    <div className="text-sm text-muted-foreground">
                      Due {payment.dueDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">${payment.amount}</div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <Button size="sm" className="gradient-primary text-white">
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
          <CardDescription>
            Detailed view of all your outstanding loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {loan.asset}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {loan.asset} Loan
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {loan.principal} {loan.asset} borrowed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${loan.currentDebt.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current debt
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Interest Rate
                    </div>
                    <div className="font-semibold">{loan.interestRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Health Factor
                    </div>
                    <div
                      className={`font-semibold ${getHealthColor(
                        loan.healthFactor
                      )}`}
                    >
                      {loan.healthFactor.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Collateral Value
                    </div>
                    <div className="font-semibold">
                      ${loan.collateralValue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Min Payment
                    </div>
                    <div className="font-semibold">${loan.minPayment}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Repayment Progress</span>
                    <span>
                      {(
                        ((loan.borrowed - (loan.currentDebt - loan.borrowed)) /
                          loan.borrowed) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      ((loan.borrowed - (loan.currentDebt - loan.borrowed)) /
                        loan.borrowed) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedLoan(loan)}
                        className="flex-1"
                      >
                        Make Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Repay {loan.asset} Loan</DialogTitle>
                        <DialogDescription>
                          Choose your payment amount and see the impact on your
                          loan
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="payment-type">Payment Type</Label>
                          <Select
                            value={paymentType}
                            onValueChange={setPaymentType}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minimum">
                                Minimum Payment (${loan.minPayment})
                              </SelectItem>
                              <SelectItem value="partial">
                                Partial Payment
                              </SelectItem>
                              <SelectItem value="full">
                                Full Payment (${loan.currentDebt})
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {paymentType === 'partial' && (
                          <div>
                            <Label htmlFor="amount">Payment Amount</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter amount"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                          </div>
                        )}
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <div className="text-sm font-medium mb-2">
                            Payment Impact
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Current Balance:</span>
                              <span>${loan.currentDebt}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payment Amount:</span>
                              <span>
                                -$
                                {paymentType === 'minimum'
                                  ? loan.minPayment
                                  : paymentType === 'full'
                                  ? loan.currentDebt
                                  : paymentAmount || 0}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                              <span>New Balance:</span>
                              <span>
                                $
                                {(
                                  loan.currentDebt -
                                  (paymentType === 'minimum'
                                    ? loan.minPayment
                                    : paymentType === 'full'
                                    ? loan.currentDebt
                                    : Number(paymentAmount) || 0)
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedLoan(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePayment}
                          className="gradient-primary text-white"
                        >
                          Confirm Payment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="gradient-primary text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Pay All Minimums (${totalMinimumDue})
            </Button>
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
