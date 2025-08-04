import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });


    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const borrows = await prisma.borrow.findMany({
        where: { user_id: user.id },
        include: { pool: true },
    });

    const deposits = await prisma.deposit.findMany({
        where: { user_id: user.id },
        include: { pool: true },
    });

    // Transform into frontend format
    const borrowData = borrows.map((b) => ({
        id: `B${b.id}`,
        type: "borrow",
        account: b.wallet_address,
        amount: Number(b.amount),
        token: b.pool.asset_symbol,
        collateral: Number(b.collateral_amount),
        collateralToken: b.collateral_asset,
        interest: Number(b.adjusted_interest_rate),
        duration: b.repaid_at
            ? Math.ceil((+b.repaid_at - +b.borrowed_at) / (1000 * 60 * 60 * 24))
            : null,
        startDate: b.borrowed_at.toISOString(),
        endDate: b.repaid_at?.toISOString() || null,
        status: b.status,
        repaid: Number(b.repaid_amount || 0),
        remaining: Number(b.amount) - Number(b.repaid_amount || 0),
    }));

    const depositData = deposits.map((d) => ({
        id: `L${d.id}`,
        type: "lend",
        account: d.wallet_address,
        amount: Number(d.amount),
        token: d.pool.asset_symbol,
        apy: Number(d.accumulated_apy),
        duration: Math.ceil((Date.now() - +d.deposited_at) / (1000 * 60 * 60 * 24)),
        startDate: d.deposited_at.toISOString(),
        endDate: d.withdraw_at?.toISOString() || null,
        status: d.withdraw_at ? "completed" : "active", // optional: determine based on other rules
        earned: Number(d.accumulated_apy || 0),
    }));

    const history = [...borrowData, ...depositData].sort((a, b) =>
        a.startDate > b.startDate ? -1 : 1
    );

    // console.log("Loan data:", history);

    return NextResponse.json(history);
}