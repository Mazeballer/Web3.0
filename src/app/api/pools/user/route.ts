import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        deposits: {
          where: { withdraw_at: null },
          include: { pool: true },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = Date.now();
    const data = user.deposits.map((d) => {
      // 1️⃣ Pull and normalize values
      const principal = parseFloat(d.amount.toString());
      const apyBps = Number(d.apy_bps ?? BigInt(0)); // e.g. 200 → 2.00%
      const apyDecimal = apyBps / 10_000;
      const dailyRate = apyDecimal / 365;

      // 2️⃣ Days since original deposit
      const depositedAt = new Date(d.deposited_at).getTime();
      const daysHeld = (now - depositedAt) / (1000 * 60 * 60 * 24);

      // 3️⃣ Compound daily interest
      const earned =
        daysHeld > 0 ? principal * (Math.pow(1 + dailyRate, daysHeld) - 1) : 0;

      return {
        depositId: Number(d.onchain_id ?? d.id),
        token: d.pool.asset_symbol,
        yourDeposit: principal,
        apy: apyDecimal * 100, // e.g. 2 or 5 (%)
        earned: parseFloat(earned.toFixed(4)), // show up to 4 decimals
        deposited_at: d.deposited_at,
        walletAddress: d.wallet_address,
      };
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('❌ /api/pools/user error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
