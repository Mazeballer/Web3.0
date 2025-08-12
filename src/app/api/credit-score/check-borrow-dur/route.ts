import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { addMonths, differenceInDays } from "date-fns";

export async function POST(req: Request) {
    try {
        const { borrowId } = await req.json();
        if (!borrowId) {
            return NextResponse.json({ error: "Missing borrowId" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const email = session?.user?.email;
        if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Get the borrow record
        const borrow = await prisma.borrow.findUnique({
            where: { id: Number(borrowId) },
            select: {
                id: true,
                user_id: true,
                status: true,
                borrowed_at: true,
                borrow_duration: true,
                repaid_at: true,
            },
        });

        if (!borrow || borrow.user_id !== user.id) {
            return NextResponse.json({ error: "Borrow not found for this user" }, { status: 404 });
        }

        // Calculate due date based on months
        const dueDate = addMonths(new Date(borrow.borrowed_at), Number(borrow.borrow_duration) || 0);

        let points = 0;
        let reason = "";
        let statusKind = "";

        if (borrow.repaid_at) {
            // If repaid, check if it was on or before due date
            if (borrow.repaid_at <= dueDate) {
                points = +20;
                reason = "On-time loan repayment";
                statusKind = "reward";
            } else {
                const daysLate = differenceInDays(borrow.repaid_at, dueDate);
                if (daysLate > 30) {
                    points = -60;
                    reason = "Missed repayment > 30 days";
                    statusKind = "punishment";
                } else {
                    points = -20;
                    reason = "Late payment";
                    statusKind = "punishment";
                }
            }
        } else {
            // If not yet repaid, check how overdue it is
            const daysLate = differenceInDays(new Date(), dueDate);
            if (daysLate > 30) {
                points = -60;
                reason = "Missed repayment > 30 days";
                statusKind = "punishment";
            } else if (daysLate > 0) {
                points = -20;
                reason = "Late payment";
                statusKind = "punishment";
            }
        }

        // Save TrustPoint + update CreditScore
        await prisma.$transaction(async (tx) => {
            await tx.trustPoint.create({
                data: {
                    user_id: user.id,
                    points: Math.abs(points),
                    reason,
                    status: statusKind,
                },
            });

            await tx.creditScore.update({
                where: { user_id: user.id },
                data: { score: { increment: points } },
            });
        });

        return NextResponse.json({
            applied: true,
            reason,
            status: statusKind,
            pointsForDisplay: Math.abs(points),
            signedChange: points,
            dueDate,
        });

    } catch (err: any) {
        console.error("repayment-eval error:", err);
        return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
    }
}
