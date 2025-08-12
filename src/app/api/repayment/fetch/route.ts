// /api/repayment/fetch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseEther } from "viem";

/** Accepts 0.0125 or 1.25 and returns 0.0125. */
const toMonthlyRate = (raw: any) => {
  const v = Number(raw ?? 0);
  if (!isFinite(v) || v <= 0) return 0;
  return v > 1 ? v / 100 : v;
};
const monthsNum = (m: any) =>
  typeof m === "bigint" ? Number(m) : Number(m ?? 0);
const addMonthsSafe = (d: Date, months: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
};

// Optional fallback map if any TrustPoint row has null/0 points:
const REASON_POINTS: Record<string, number> = {
  "On-time loan repayment": 20,
  "3 Consecutive good loans": 50,
  "Verified identity (KYC)": 20,
  "Lending funds ≥ 30 days": 15,
  "Consistent lending over 3 months": 30,
  "No withdrawal from lending pool ≥ 60 days": 20,

  "Late payment": 20, // will be subtracted
  "Missed repayment > 30 days": 60,
  "High loan frequency": 20,
  "Over-borrowing": 25,
  "Early withdrawal from lending pool": 20,
};

function normalizeLoans(loans: any[]) {
  return loans.map((l: any) => {
    const amount = Number(l.amount);
    const r = toMonthlyRate(l.adjusted_interest_rate);
    const months = monthsNum(l.borrow_duration);
    const totalDue = amount + amount * r * months;

    return {
      id: l.id,
      borrowed_at: l.borrowed_at,
      borrow_duration: months,
      status: l.status,
      collateral_asset: l.collateral_asset,
      onChainLoanId: l.onchain_id != null ? Number(l.onchain_id) : null,
      borrower: l.wallet_address as `0x${string}`,
      amount,
      totalDue,
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
      // ===== Total Outstanding (active/late) =====
      const borrowings = await prisma.borrow.findMany({
        where: { user_id: user.id, status: { in: ["active", "late"] } },
        select: {
          amount: true,
          adjusted_interest_rate: true,
          borrow_duration: true,
        },
      });

      const totalOutstanding = borrowings.reduce((sum, b) => {
        const principal = Number(b.amount ?? 0);
        const r = toMonthlyRate(b.adjusted_interest_rate);
        const months = monthsNum(b.borrow_duration);
        const totalDue = principal + principal * r * months;
        return sum + totalDue;
      }, 0);

      // ===== Borrow-based counters (for display) =====
      const allLoans = await prisma.borrow.findMany({
        where: { user_id: user.id },
        select: {
          borrowed_at: true,
          borrow_duration: true,
          amount: true,
          adjusted_interest_rate: true,
          status: true,
          repaid_at: true,
          repaid_amount: true,
        },
      });

      const now = new Date();
      let onTimePayments = 0;
      let latePayments = 0;
      let overdueActive = 0;

      for (const l of allLoans) {
        const principal = Number(l.amount ?? 0);
        const r = toMonthlyRate(l.adjusted_interest_rate);
        const months = monthsNum(l.borrow_duration);
        const dueDate = addMonthsSafe(new Date(l.borrowed_at), months);
        const totalDue = principal + principal * r * months;

        if (l.status === "completed") {
          const repaidAt = l.repaid_at ? new Date(l.repaid_at) : null;
          const repaidAmt = Number(l.repaid_amount ?? 0);
          const paidEnough = repaidAmt + 1e-9 >= totalDue;
          const paidOnTime = !!repaidAt && repaidAt <= dueDate;

          if (paidEnough && paidOnTime) onTimePayments++;
          else latePayments++;
        } else if (
          (l.status === "active" || l.status === "late") &&
          now > dueDate
        ) {
          overdueActive++;
        }
      }

      // ===== Credit Impact from TrustPoint (rewards − punishments) =====
      // NOTE: Adjust model name if your Prisma model differs (e.g., trustPoint or Trustpoint).
      const trustRows = await prisma.trustPoint.findMany({
        where: { user_id: user.id },
        select: { points: true, status: true, reason: true },
        orderBy: { awarded_at: "asc" }, // optional, if you ever need ordering
      });

      const creditImpactRaw = trustRows.reduce((sum, row) => {
        const base = Number(row.points ?? 0);
        // fallback if points missing or 0, use the reason map
        const pts = base > 0 ? base : REASON_POINTS[row.reason] ?? 0;
        const signed = row.status?.toLowerCase() === "punishment" ? -pts : pts;
        return sum + signed;
      }, 0);

      // If you want a hard cap, uncomment next line:
      // const creditImpact = Math.max(-999, Math.min(999, creditImpactRaw));
      const creditImpact = creditImpactRaw;

      return NextResponse.json({
        totalOutstanding,
        activeLoanCount: borrowings.length,
        creditImpact,
        onTimePayments,
        latePayments,
        overdueActive,
      });
    }

    // ===== Active/Late loans list =====
    const loans = await prisma.borrow.findMany({
      where: { user_id: user.id, status: { in: ["active", "late"] } },
      select: {
        id: true,
        borrowed_at: true,
        borrow_duration: true,
        status: true,
        amount: true,
        collateral_amount: true,
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
