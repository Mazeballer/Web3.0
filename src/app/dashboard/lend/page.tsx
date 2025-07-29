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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { useContractWrite } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { parseAbiItem, decodeEventLog, getEventSelector } from 'viem';
import LendingPoolABI from '@/abis/LendingPool.json';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import type { Hex } from 'viem';
import {
  Banknote,
  TrendingUp,
  Wallet as WalletIcon,
  Plus,
  Minus,
  Star,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { PublicClient } from 'viem';

export default function LendPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const client = usePublicClient() as PublicClient;
  const { open } = useAppKit();
  const { toast } = useToast();
  const {
    data: totalDeposited = 0,
    isLoading: isTotalLoading,
    isError: isTotalError,
  } = useQuery<number>({
    queryKey: ['totalDeposited', address!],
    queryFn: async () => {
      const res = await fetch(`/api/deposits/total?email=${userEmail}`);
      const json = (await res.json()) as { totalDeposited: string };
      return parseFloat(json.totalDeposited);
    },
    enabled: !!address,
  });

  const { data: earnedAmount = 0, isLoading: isEarnedLoading } =
    useQuery<number>({
      queryKey: ['earned', address!],
      queryFn: async () => {
        const res = await fetch(`/api/deposits/earnings?email=${userEmail}`);
        const json = await res.json();
        return parseFloat(json.earned);
      },
      enabled: !!address,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false, // Don’t re-fetch on tab focus
    });

  const { data: lendingPools = [] } = useQuery({
    queryKey: ['userPools', userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/pools/user?email=${userEmail}`);
      const data = await res.json();

      console.log('🐳 /api/pools/user response:', data);

      const iconMap: Record<string, string> = {
        GO: '◈',
      };

      return data.map((pool: any) => ({
        ...pool,
        icon: iconMap[pool.token?.toUpperCase()] || '❓',
      }));
    },
    enabled: !!userEmail,
  });

  const [selectedPool, setSelectedPool] = useState<
    (typeof lendingPools)[0] | null
  >(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const qc = useQueryClient();
  const poolAddress = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS!;

  const { writeContractAsync, isPending } = useContractWrite({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Transaction sent' });
      },
      onError: (error: Error) => {
        toast({
          title: 'Transaction failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  async function handleDeposit() {
    const amountNum = parseFloat(depositAmount);
    if (!depositAmount || isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a valid deposit > 0.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // 1️⃣ Send transaction
      const txHash = await writeContractAsync({
        address: poolAddress as `0x${string}`,
        abi: LendingPoolABI.abi,
        functionName: 'deposit',
        args: [],
        value: parseEther(depositAmount),
      });
      toast({ title: 'Transaction sent', description: txHash });

      // 2️⃣ Wait + log receipt
      const receipt = await client.waitForTransactionReceipt({ hash: txHash });
      console.group('⛓ deposit receipt');
      console.log('status:', receipt.status); // should be "success"
      console.log('gasUsed:', receipt.gasUsed?.toString());
      console.log('logs count:', receipt.logs.length);
      receipt.logs.forEach((l, i) =>
        console.log(` log[${i}]`, { topics: l.topics, data: l.data })
      );
      console.groupEnd();

      // 3️⃣ Compute event selector & find the one log
      const selector = getEventSelector(
        parseAbiItem(
          'event Deposited(address indexed user, uint256 depositId, uint256 amount, uint256 timestamp)'
        )
      );
      console.log('expected Deposited topic0:', selector);

      const depositLog = receipt.logs.find((l) => l.topics[0] === selector);
      if (!depositLog) {
        toast({
          title: 'No Deposited event found',
          description: 'Your contract may not have emitted Deposited',
          variant: 'destructive',
        });
        return;
      }

      // 4️⃣ Decode and cast to your known shape
      const raw = decodeEventLog({
        abi: LendingPoolABI.abi,
        data: depositLog.data,
        topics: depositLog.topics,
      });
      const decoded = raw as unknown as {
        args: { depositId: bigint; amount: bigint; timestamp: bigint };
      };
      const onchainId = Number(decoded.args.depositId);
      console.log('✅ onchain depositId =', onchainId);

      // 5️⃣ Persist to your backend
      await fetch('/api/deposits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          walletAddress: address,
          amount: depositAmount,
          txHash,
          onchain_id: onchainId,
        }),
      });

      // 6️⃣ Refresh UI
      qc.invalidateQueries({ queryKey: ['totalDeposited', address!] });
      qc.invalidateQueries({ queryKey: ['deposits', address!] });
      qc.invalidateQueries({ queryKey: ['userPools', address!] });

      toast({ title: 'Deposit successful!' });
      setDepositAmount('');
      setIsDialogOpen(false);
    } catch (e) {
      toast({
        title: 'Transaction failed',
        description: (e as Error).message,
        variant: 'destructive',
      });
    }
  }

  const handleWithdraw = async () => {
    if (!selectedPool) return;
    const max = parseFloat(selectedPool.yourDeposit);
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > max) {
      return toast({
        title: 'Invalid amount',
        description: `Max is ${selectedPool.yourDeposit}`,
        variant: 'destructive',
      });
    }

    try {
      const txHash = await writeContractAsync({
        address: poolAddress as `0x${string}`,
        abi: LendingPoolABI.abi,
        functionName: 'withdraw',
        args: [selectedPool.depositId, parseEther(withdrawAmount)],
      });
      toast({ title: 'Withdrawal sent', description: txHash });

      const receipt = await client.waitForTransactionReceipt({ hash: txHash });

      // decode the Withdrawn event:
      const selector = getEventSelector(
        parseAbiItem(
          'event Withdrawn(address indexed user, uint256 depositId, uint256 amount, uint256 interest)'
        )
      );
      const log = receipt.logs.find((l) => l.topics[0] === selector);
      if (!log) throw new Error('No Withdrawn event found');

      // 1) Decode and cast to the known event‐shape
      const decodedEvent = decodeEventLog({
        abi: LendingPoolABI.abi,
        data: log.data,
        topics: log.topics,
      }) as unknown as {
        args: {
          depositId: bigint;
          amount: bigint;
          interest: bigint;
        };
      };

      // 2) Now destructure with proper types
      const { depositId, amount: withdrawn, interest } = decodedEvent.args;

      // update your backend with the on‐chain result
      await fetch('/api/deposits/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          depositId: Number(depositId),
          amount: formatEther(withdrawn),
          interest: formatEther(interest),
        }),
      });

      qc.invalidateQueries();
      toast({ title: 'Withdraw successful!' });
      setWithdrawAmount('');
      setSelectedPool(null);
    } catch (e) {
      toast({
        title: 'Withdraw failed',
        description: (e as Error).message,
        variant: 'destructive',
      });
    }
  };

  // If not connected, show a connect prompt
  if (!isConnected) {
    return (
      <Card className="gradient-card text-center p-12">
        <CardContent>
          <Banknote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet to Lend</h3>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to start earning yield by lending your assets
          </p>
          <Button
            onClick={() => open()}
            className="gradient-primary text-white hover:opacity-90"
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalRewardPoints = lendingPools.reduce(
    (sum, p) => sum + p.rewardPoints,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header + New Deposit */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Lend Assets
          </h1>
          <p className="text-muted-foreground mt-2">
            Earn yield by lending your crypto assets with competitive APY
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gradient-secondary text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Deposit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Deposit GO</DialogTitle>
              <DialogDescription>
                Earn up to{' '}
                <span className="font-semibold text-emerald-600">8% APY</span>{' '}
                on your deposited GO tokens.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="deposit-amount">Amount (GO)</Label>
                <Input
                  id="deposit-amount"
                  placeholder="0.1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <Button
                onClick={handleDeposit}
                disabled={isPending}
                className="w-full gradient-secondary text-white hover:opacity-90"
              >
                {isPending ? 'Processing…' : 'Confirm Deposit'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-card">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deposited
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalDeposited.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {lendingPools.length}{' '}
              {lendingPools.length === 1 ? 'pool' : 'pools'}
            </p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {isEarnedLoading && !earnedAmount
                ? '...'
                : `$${earnedAmount.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {totalRewardPoints}
            </div>
            <p className="text-xs text-muted-foreground">Loyalty rewards</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Lending Positions */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Your Lending Positions</CardTitle>
          <CardDescription>
            Overview of your deposits and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>APY</TableHead>
                <TableHead>Your Deposit</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Deposit Age</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lendingPools.map((pool) => (
                <TableRow key={pool.depositId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pool.icon || '❓'}</span>
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
                    <span className="text-sm text-muted-foreground">
                      {pool.deposited_at
                        ? formatDistanceToNow(new Date(pool.deposited_at), {
                            addSuffix: true,
                          })
                        : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPool(pool)}
                          >
                            <Minus className="h-3 w-3 mr-1" />
                            Withdraw
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Withdraw {pool.token}</DialogTitle>
                            <DialogDescription>
                              Withdraw your deposited {pool.token}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-muted/30 rounded-lg">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Available:</span>
                                  <span className="font-medium">
                                    {pool.yourDeposit} {pool.token}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Earned:</span>
                                  <span className="text-emerald-600 font-medium">
                                    +{pool.earned} {pool.token}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="withdraw-amount">
                                Withdrawal Amount
                              </Label>
                              <Input
                                id="withdraw-amount"
                                placeholder={`Max: ${pool.yourDeposit}`}
                                value={withdrawAmount}
                                onChange={(e) =>
                                  setWithdrawAmount(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              onClick={handleWithdraw}
                              className="w-full"
                              variant="outline"
                              disabled={isPending}
                            >
                              {isPending ? 'Processing...' : 'Withdraw Assets'}
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
  );
}
