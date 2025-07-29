import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      walletAddress,
      amount,
      txHash,
      email: userEmail,
      onchain_id, // ← NEW
    } = body;

    if (
      !walletAddress ||
      !amount ||
      !txHash ||
      !userEmail ||
      onchain_id == null // ← validate it
    ) {
      return new NextResponse('Missing or invalid required fields', {
        status: 400,
      });
    }

    // 1) Find user
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return new NextResponse('User not found', { status: 404 });

    // 2) Upsert the GO pool
    let pool = await prisma.pool.findFirst({ where: { asset_symbol: 'GO' } });
    if (pool) {
      pool = await prisma.pool.update({
        where: { id: pool.id },
        data: { total_liquidity: { increment: parseFloat(amount) } },
      });
    } else {
      pool = await prisma.pool.create({
        data: {
          asset_symbol: 'GO',
          total_liquidity: parseFloat(amount),
          total_borrowed: 0,
          base_interest_rate: 0,
          base_apy: 8.0,
        },
      });
    }

    // 3) Create the Deposit row, now including onchain_id
    const deposit = await prisma.deposit.create({
      data: {
        user_id: user.id,
        pool_id: pool.id,
        amount: parseFloat(amount),
        tx_hash: txHash,
        wallet_address: walletAddress,
        onchain_id, 
      },
    });

    console.log('✅ Deposit created:', deposit);
    return NextResponse.json({ success: true, message: 'Deposit recorded' });
  } catch (error) {
    console.error('❌ Error in /api/deposits/create:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
