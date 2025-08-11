// /api/credit-score/check-3-good-loans/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { addMonths } from "date-fns";

export async function POST() {
    try {
        // 1. Auth & Get user
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

        // 2. Get latest 3 repaid loans
        const loans = await prisma.borrow.findMany({
            where: {
                user_id: user.id,
                repaid_at: { not: null },
            },
            orderBy: { repaid_at: "desc" },
            take: 3,
            select: {
                borrowed_at: true,
                borrow_duration: true,
                repaid_at: true,
            },
        });

        if (loans.length < 3) {
            return NextResponse.json({
                awarded: false,
                reason: "Not enough repaid loans",
            });
        }

        // 3. Check all 3 repaid on or before due date
        const allGood = loans.every((loan) => {
            const dueDate = addMonths(
                new Date(loan.borrowed_at),
                Number(loan.borrow_duration) || 0
            );
            return loan.repaid_at && loan.repaid_at <= dueDate;
        });

        if (!allGood) {
            return NextResponse.json({
                awarded: false,
                reason: "Not all 3 were on-time",
            });
        }

        // 4. Award +50 points
        await prisma.$transaction(async (tx) => {
            await tx.trustPoint.create({
                data: {
                    user_id: user.id,
                    points: 50,
                    reason: "3 Consecutive good loans",
                    status: "reward",
                },
            });
            await tx.creditScore.update({
                where: { user_id: user.id },
                data: { score: { increment: 50 } },
            });
        });

        return NextResponse.json({
            awarded: true,
            points: 50,
            reason: "3 Consecutive good loans",
        });

    } catch (err: any) {
        console.error("Error checking consecutive good loans:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
