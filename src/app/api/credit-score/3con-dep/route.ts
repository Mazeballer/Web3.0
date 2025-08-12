import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

    const now = new Date();

    // Previous 2 months date ranges
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const endOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);

    // Check deposits for last month
    const lastMonthDeposit = await prisma.deposit.findFirst({
        where: {
            user_id: user.id,
            deposited_at: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
    });

    // Check deposits for two months ago
    const twoMonthsAgoDeposit = await prisma.deposit.findFirst({
        where: {
            user_id: user.id,
            deposited_at: { gte: startOfTwoMonthsAgo, lte: endOfTwoMonthsAgo },
        },
    });

    // Condition check
    const meetsRequirement = !!lastMonthDeposit && !!twoMonthsAgoDeposit;

    if (!meetsRequirement) {
        return NextResponse.json({ meetsRequirement: false });
    }

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const alreadyClaimed = await prisma.trustPoint.findFirst({
        where: {
            user_id: user.id,
            reason: "3 Consecutive good loans",
            awarded_at: {
                gte: startOfThisMonth,
                lte: endOfThisMonth,
            },
        },
    });

    if (alreadyClaimed) {
        return NextResponse.json({
            meetsRequirement: true,
            alreadyClaimed: true,
            message: "Reward already claimed this month",
        });
    }

    // ✅ If meets requirement → update CreditScore and TrustPoint
    await prisma.$transaction(async (tx) => {
        // 1. Update CreditScore (+30)
        await tx.creditScore.update({
            where: { user_id: user.id },
            data: { score: { increment: 30 } },
        });

        // 2. Insert TrustPoint
        await tx.trustPoint.create({
            data: {
                user_id: user.id,
                points: 30,
                reason: "3 Consecutive good loans",
                status: "reward",
            },
        });
    });

    return NextResponse.json({ meetsRequirement: true, addedPoints: 30 });
}
