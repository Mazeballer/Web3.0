import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return new NextResponse('Missing email', { status: 400 });

  const deposits = await prisma.deposit.findMany({
    where: {
      user: { email },
      withdraw_at: null,
    },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let totalEarned = 0;

  for (const d of deposits) {
    const apyBps = Number(d.apy_bps ?? BigInt(0));
    const apyDecimal = apyBps / 10_000;
    const dailyRate = apyDecimal / 365;

    const depositedAt = new Date(d.deposited_at);
    const effectiveStart =
      depositedAt > startOfMonth ? depositedAt : startOfMonth;
    const daysHeld =
      (now.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24);
    if (daysHeld <= 0) continue;

    const principal = Number(d.amount);
    const earned = principal * (Math.pow(1 + dailyRate, daysHeld) - 1);
    totalEarned += earned;
  }

  return NextResponse.json({ earned: totalEarned.toFixed(2) });
}
