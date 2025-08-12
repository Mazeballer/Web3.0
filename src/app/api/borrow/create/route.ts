import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const {
    email,
    poolToken,
    amount,
    collateralAmount,
    collateralAsset,
    baseInterestRate,
    adjustedInterestRate,
    txHash,
    walletAddress,
    onchainId,
    loanDuration,
  } = data;

  console.log("Data: ", data);

  try {
    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get pool ID
    const pool = await prisma.pool.findFirst({
      where: { asset_symbol: poolToken },
      select: { id: true },
    });

    if (!pool)
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });

    if (onchainId === null) {
      return NextResponse.json(
        { error: "Missing on-chain loan ID" },
        { status: 400 }
      );
    }

    // Create the Borrow record
    const borrow = await prisma.borrow.create({
      data: {
        user_id: user.id,
        pool_id: pool.id,
        amount,
        collateral_amount: collateralAmount,
        collateral_asset: collateralAsset,
        base_interest_rate: baseInterestRate,
        adjusted_interest_rate: adjustedInterestRate,
        status: "active",
        tx_hash: txHash,
        wallet_address: walletAddress,
        onchain_id: BigInt(onchainId),
        borrow_duration: BigInt(loanDuration),
      },
    });

    // 🔄 Update Pool's total_borrowed
    await prisma.pool.update({
      where: { id: pool.id },
      data: {
        total_borrowed: {
          increment: amount, // `amount` should be a number or Decimal
        },
      },
    });

    return NextResponse.json({ success: true, borrow });
  } catch (err) {
    console.error("Failed to save borrow:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
