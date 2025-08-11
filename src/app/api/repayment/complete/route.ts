// /api/repayment/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const email = session.user.email;
  const body = await req.json();
  const { loanId, txHash } = body as { loanId: number; txHash?: string };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ ok: false }, { status: 404 });

  // load the loan to compute the due amount (server is source of truth)
  const loan = await prisma.borrow.findFirst({
    where: { id: loanId, user_id: user.id },
    select: {
      id: true,
      amount: true,
      adjusted_interest_rate: true,
      borrow_duration: true,
      status: true,
    },
  });
  if (!loan)
    return NextResponse.json(
      { ok: false, error: "loan not found" },
      { status: 404 }
    );

  const principal = Number(loan.amount);
  const ratePct = Number(loan.adjusted_interest_rate ?? 0);
  const months =
    typeof loan.borrow_duration === "bigint"
      ? Number(loan.borrow_duration)
      : Number(loan.borrow_duration ?? 0);

  const totalDue = principal + principal * (ratePct) * months;

  // mark repaid
  await prisma.borrow.update({
    where: { id: loan.id },
    data: {
      status: "completed",
      repaid_at: new Date(),
      repaid_amount: totalDue,
      // optionally persist tx hash
      tx_hash: txHash ?? undefined,
    },
  });

  return NextResponse.json({ ok: true, totalDue });
}
