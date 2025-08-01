import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, depositId, amount, interest } = await req.json();

  if (!email || depositId == null || amount == null || interest == null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    // 1️⃣ Find the deposit by onchain_id + user.email
    const deposit = await prisma.deposit.findFirst({
      where: {
        onchain_id: Number(depositId),
        user: { email }, // ← nested filter on the User relation
      },
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

    // 2️⃣ Update withdraw_at on that record
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: { withdraw_at: new Date() },
    });

    // 3️⃣ Adjust pool liquidity
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
