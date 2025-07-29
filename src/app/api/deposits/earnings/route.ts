import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return new NextResponse('Missing email', { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return new NextResponse('User not found', { status: 404 });
  }

  const deposits = await prisma.deposit.findMany({
    where: {
      user_id: user.id,
      withdraw_at: null, // ✅ Correct filter location
    },
    include: {
      pool: true,
    },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const APY = 0.08;
  const dailyRate = APY / 365;

  let totalEarned = 0;

  for (const deposit of deposits) {
    const depositDate = new Date(deposit.deposited_at);
    const effectiveStartDate =
      depositDate > startOfMonth ? depositDate : startOfMonth;

    const daysHeld =
      (now.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysHeld <= 0) continue;

    const earned =
      Number(deposit.amount) * (Math.pow(1 + dailyRate, daysHeld) - 1);
    totalEarned += earned;
  }

  return NextResponse.json({ earned: totalEarned.toFixed(2) });
}
