// /api/repayment/fetch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseEther } from "viem";

function normalizeLoans(loans: any[]) {
  return loans.map((l: any) => {
    const amount = Number(l.amount); // principal (ETH/GO)
    const ratePct = Number(l.adjusted_interest_rate ?? 0); // e.g. 1.25 (%)
    const months =
      typeof l.borrow_duration === "bigint"
        ? Number(l.borrow_duration)
        : Number(l.borrow_duration ?? 0);

    const totalDue = amount + amount * (ratePct / 100) * months;

    return {
      id: l.id,
      borrowed_at: l.borrowed_at,
      borrow_duration: months,
      status: l.status,
      collateral_asset: l.collateral_asset,
      onChainLoanId: l.onchain_id != null ? Number(l.onchain_id) : null,
      borrower: l.wallet_address as `0x${string}`,
      amount,
      totalDue, // optional display
      repayWei: parseEther(String(totalDue)).toString(),
      collateralWei: parseEther(String(l.collateral_amount ?? 0)).toString(),
    };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const summary = searchParams.get("summary");

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ totalOutstanding: 0 }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ totalOutstanding: 0 }, { status: 404 });

  try {
    if (summary === "true") {
      // === existing outstanding calc (keep yours) ===
      const borrowings = await prisma.borrow.findMany({
        where: { user_id: user.id, status: { in: ["active", "late"] } },
        select: {
          amount: true,
          adjusted_interest_rate: true,
          borrow_duration: true,
        },
      });

      const totalOutstanding = borrowings.reduce((sum, b) => {
        const principal = Number(b.amount);
        const ratePct = Number(b.adjusted_interest_rate ?? 0);
        const months =
          typeof b.borrow_duration === "bigint"
            ? Number(b.borrow_duration)
            : Number(b.borrow_duration ?? 0);

        const totalDue = principal + principal * (ratePct / 100) * months;
        return sum + totalDue;
      }, 0);

      // === NEW: credit impact metrics aligned with "Loans at Risk" ===
      const allLoans = await prisma.borrow.findMany({
        where: { user_id: user.id },
        select: {
          borrowed_at: true,
          borrow_duration: true, // months (BigInt|number)
          amount: true, // principal
          adjusted_interest_rate: true, // % per month
          status: true, // active | late | completed
          repaid_at: true,
          repaid_amount: true, // Decimal
        },
      });

      const addMonthsSafe = (d: Date, months: number) => {
        const x = new Date(d);
        x.setMonth(x.getMonth() + months);
        return x;
      };

      const now = new Date();
      let onTimePayments = 0;
      let latePayments = 0;
      let overdueActive = 0;

      for (const l of allLoans) {
        const principal = Number(l.amount ?? 0);
        const ratePct = Number(l.adjusted_interest_rate ?? 0); // e.g. 1.25
        const months =
          typeof l.borrow_duration === "bigint"
            ? Number(l.borrow_duration)
            : Number(l.borrow_duration ?? 0);

        // Same due-date logic as Loans at Risk
        const dueDate = addMonthsSafe(new Date(l.borrowed_at), months);

        // Monetary total due (principal + monthly simple interest * months)
        const totalDue = principal + principal * (ratePct / 100) * months;

        if (l.status === "completed") {
          const repaidAt = l.repaid_at ? new Date(l.repaid_at) : null;
          const repaidAmt = Number(l.repaid_amount ?? 0);

          const paidEnough = repaidAmt + 1e-9 >= totalDue; // tiny epsilon for Decimal→Number
          const paidOnTime = !!repaidAt && repaidAt <= dueDate;

          if (paidEnough && paidOnTime) {
            onTimePayments++;
          } else {
            // If either paid late or paid less than totalDue → count as late
            latePayments++;
          }
        } else if (
          (l.status === "active" || l.status === "late") &&
          now > dueDate
        ) {
          overdueActive++;
        }
      }

      // Scoring — tweak weights as you like
      let creditImpact =
        onTimePayments * 5 - (latePayments * 10 + overdueActive * 7);
      creditImpact = Math.max(-99, Math.min(99, creditImpact));

      return NextResponse.json({
        totalOutstanding,
        activeLoanCount: borrowings.length,
        creditImpact,
        onTimePayments,
        latePayments,
        overdueActive,
      });
    }

    const loans = await prisma.borrow.findMany({
      where: { user_id: user.id, status: { in: ["active", "late"] } }, // ⬅️ hide completed
      select: {
        id: true,
        borrowed_at: true,
        borrow_duration: true,
        status: true,
        amount: true,
        collateral_amount: true, // ⬅️ add this
        collateral_asset: true,
        wallet_address: true,
        onchain_id: true,
        adjusted_interest_rate: true,
      },
      orderBy: { borrowed_at: "desc" },
    });

    return NextResponse.json(normalizeLoans(loans));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
