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

function normalizeLoans(loans: any[]) {
  return loans.map((l: any) => {
    const amount = Number(l.amount); // principal (ETH/GO)
    const r = toMonthlyRate(l.adjusted_interest_rate); // normalize rate
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
    select: { id: true, verified: true },
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

      // ===== Completed loans for on-time / consecutive logic =====
      const completedLoans = await prisma.borrow.findMany({
        where: { user_id: user.id, status: "completed" },
        orderBy: { repaid_at: "asc" }, // chronological for streak calc
        select: {
          borrowed_at: true,
          borrow_duration: true,
          amount: true,
          adjusted_interest_rate: true,
          repaid_at: true,
          repaid_amount: true,
        },
      });

      // Compute per-loan on-time/full flags
      const onTimeFlags: boolean[] = [];
      for (const l of completedLoans) {
        const principal = Number(l.amount ?? 0);
        const r = toMonthlyRate(l.adjusted_interest_rate);
        const months = monthsNum(l.borrow_duration);
        const dueDate = addMonthsSafe(new Date(l.borrowed_at), months);
        const totalDue = principal + principal * r * months;

        const repaidAt = l.repaid_at ? new Date(l.repaid_at) : null;
        const repaidAmt = Number(l.repaid_amount ?? 0);
        const paidEnough = repaidAmt + 1e-9 >= totalDue;
        const paidOnTime = !!repaidAt && repaidAt <= dueDate;

        onTimeFlags.push(paidEnough && paidOnTime);
      }
      const onTimePayments = onTimeFlags.filter(Boolean).length;

      // Count non-overlapping triplets of consecutive on-time loans
      let consecutiveTriplets = 0;
      let run = 0;
      for (const ok of onTimeFlags) {
        run = ok ? run + 1 : 0;
        if (run === 3) {
          consecutiveTriplets += 1;
          run = 0; // non-overlapping triplets
        }
      }

      // ===== Overdue active/late count for display =====
      const allOpen = await prisma.borrow.findMany({
        where: { user_id: user.id, status: { in: ["active", "late"] } },
        select: {
          borrowed_at: true,
          borrow_duration: true,
          status: true,
        },
      });
      const now = new Date();
      let overdueActive = 0;
      for (const l of allOpen) {
        const months = monthsNum(l.borrow_duration);
        const dueDate = addMonthsSafe(new Date(l.borrowed_at), months);
        if (now > dueDate) overdueActive++;
      }
      // Late payments (completed but late/underpaid) for display only
      const latePayments = completedLoans.length - onTimePayments;

      // ===== TrustPoint base sum & counts by reason =====
      const trustRows = await prisma.trustPoint.findMany({
        where: { user_id: user.id },
        select: { points: true, status: true, reason: true },
      });

      const trustBase = trustRows.reduce((sum, row) => {
        const pts = Number(row.points ?? 0) || 0;
        const signed = row.status?.toLowerCase() === "punishment" ? -pts : pts;
        return sum + signed;
      }, 0);

      // Count how many times these achievements are already logged
      const reasonCount = trustRows.reduce<Record<string, number>>((acc, r) => {
        const key = (r.reason || "").trim();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const loggedOnTime = reasonCount["On-time loan repayment"] || 0;
      const logged3Consec = reasonCount["3 Consecutive good loans"] || 0;
      const loggedKYC = reasonCount["Verified identity (KYC)"] || 0;

      // ===== Derive extra points from Borrow/User that are NOT yet logged =====
      let derivedExtra = 0;

      // On-time (+20 each) not yet in TrustPoint
      const extraOnTime = Math.max(0, onTimePayments - loggedOnTime);
      derivedExtra += extraOnTime * 20;

      // 3 consecutive (+50 per non-overlapping triplet) not yet in TrustPoint
      const extraTriplets = Math.max(0, consecutiveTriplets - logged3Consec);
      derivedExtra += extraTriplets * 50;

      // Verified identity (KYC) from User table (+20) if verified and not logged
      if (user.verified && loggedKYC === 0) {
        derivedExtra += 20;
      }

      const creditImpact = trustBase + derivedExtra;

      return NextResponse.json({
        totalOutstanding,
        activeLoanCount: borrowings.length,
        creditImpact,
        onTimePayments,
        latePayments,
        overdueActive,
        // Optional debug fields (comment out in prod)
        // trustBase,
        // derivedExtra,
        // extraOnTime,
        // extraTriplets,
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
