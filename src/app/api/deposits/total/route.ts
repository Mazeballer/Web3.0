import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deposits = await prisma.deposit.findMany({
      where: {
        user_id: user.id,
        withdraw_at: null, // ✅ This is now correctly applied
      },
    });

    const total = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
    return NextResponse.json({ totalDeposited: total.toFixed(2) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
