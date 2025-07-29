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

    const data = user.deposits.map((deposit) => ({
      depositId: Number(deposit.onchain_id ?? deposit.id), // <- force into JS number
      token: deposit.pool.asset_symbol,
      yourDeposit: parseFloat(deposit.amount.toString()), // Decimal → string → number
      apy: parseFloat(deposit.pool.base_apy.toString()), // Decimal → string → number
      earned: 0,
      // If you actually need the date on the client, stringify it:
      deposited_at: deposit.deposited_at.toISOString(), // Date → ISO string
      rewardPoints: 0,
    }));

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('❌ /api/pools/user error:', err);
    // Surface the real error message for debugging
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
