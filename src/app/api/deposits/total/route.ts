// src/app/api/deposits/total/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    // 1️ Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2️ Fetch all active (non-withdrawn) deposits
    const deposits = await prisma.deposit.findMany({
      where: {
        user_id: user.id,
        withdraw_at: null,
      },
    });

    // 3️ Sum up principal and compute accrued interest for each
    const now = new Date();
    let totalPrincipal = 0;
    let totalInterest = 0;

    for (const d of deposits) {
      const principal = Number(d.amount);
      totalPrincipal += principal;

      // convert bps → decimal, then daily rate
      const apyBps = Number(d.apy_bps ?? BigInt(0));
      const apyDecimal = apyBps / 10_000;
      const dailyRate = apyDecimal / 365;

      // days since deposit
      const depositedAt = new Date(d.deposited_at).getTime();
      const daysHeld = (now.getTime() - depositedAt) / (1000 * 60 * 60 * 24);

      if (daysHeld > 0) {
        // compound daily: principal * ((1+dailyRate)^daysHeld - 1)
        const interest = principal * (Math.pow(1 + dailyRate, daysHeld) - 1);
        totalInterest += interest;
      }
    }

    const totalBalance = totalPrincipal + totalInterest;

    // 4️ Return all three values:
    return NextResponse.json({
      totalDeposited: totalPrincipal.toFixed(2), // e.g. "100.00"
      totalInterest: totalInterest.toFixed(2), // e.g. "1.23"
      totalBalance: totalBalance.toFixed(2), // e.g. "101.23"
    });
  } catch (err) {
    console.error('[TOTAL ERROR]', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
