import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  const { email, depositId, amount, interest } = await req.json();

  if (!email || depositId == null || amount == null || interest == null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    // 1) Find deposit by on-chain id + user email
    const deposit = await prisma.deposit.findFirst({
      where: { onchain_id: Number(depositId), user: { email } },
    });
    if (!deposit) {
      return NextResponse.json(
        { error: 'Deposit not found or not yours' },
        { status: 404 }
      );
    }
    if (deposit.withdraw_at) {
      return NextResponse.json({ error: 'Already withdrawn' }, { status: 400 });
    }

    const principalDec = new Prisma.Decimal(amount);
    const interestDec = new Prisma.Decimal(interest);
    const totalPayout = principalDec.plus(interestDec);

    // 2) Update withdraw_at and store realized APY (interest)
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        withdraw_at: new Date(),
        accumulated_apy: totalPayout,
      },
    });

    // 3) Decrement pool liquidity by principal + interest
    await prisma.pool.update({
      where: { id: deposit.pool_id },
      data: {
        total_liquidity: {
          decrement: parseFloat(amount) + parseFloat(interest),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[WITHDRAW ERROR]', err);
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}
