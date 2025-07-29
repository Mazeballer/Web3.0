import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, depositId, amount, interest } = body;

  if (!email || !depositId || amount == null || interest == null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit || deposit.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Deposit not found or does not belong to user' },
        { status: 403 }
      );
    }

    if (deposit.withdraw_at) {
      return NextResponse.json(
        { error: 'Deposit already withdrawn' },
        { status: 400 }
      );
    }

    // 1. Update the deposit record
    await prisma.deposit.update({
      where: { id: depositId },
      data: {
        withdraw_at: new Date(),
      },
    });

    // 2. Update the pool liquidity
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
