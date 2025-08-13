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

    const { loanId } = await req.json();

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the deposit record
    const deposit = await prisma.deposit.findUnique({
        where: { id: loanId },
        select: { deposited_at: true },
    });

    if (!deposit) {
        return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    const now = new Date();
    const depositDate = deposit.deposited_at;

    // Days difference
    const diffDays = Math.floor(
        (now.getTime() - depositDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let points = 0;
    let reason = "";
    let status = "";

    if (diffDays >= 60) {
        points = 20;
        reason = "No withdrawal from lending pool ≥ 60 days";
        status = "reward";
    } else if (diffDays >= 30) {
        points = 15;
        reason = "Lending funds ≥ 30 days";
        status = "reward";
    } else {
        points = -20;
        reason = "Early withdrawal from lending pool";
        status = "punishment";
    }

    let absPoint = Math.abs(points);

    // Save trust point record
    await prisma.trustPoint.create({
        data: {
            user_id: user.id,
            points: absPoint,
            reason,
            status,
        },
    });

    // Update credit score if it's a reward
    await prisma.creditScore.update({
        where: { user_id: user.id },
        data: { score: { increment: points } },
    });

    return NextResponse.json({
        success: true,
        daysHeld: diffDays,
        pointsAwarded: points,
        reason,
        status,
    });
}
