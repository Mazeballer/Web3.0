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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Count active loans in last 30 days
    const activeLoanCount = await prisma.borrow.count({
        where: {
            user_id: user.id,
            status: { not: "completed" },
            borrowed_at: { gte: thirtyDaysAgo },
        },
    });

    if (activeLoanCount > 3) {
        const points = -40;
        const reason = "High loan frequency";
        const status = "punishment";

        // Add trust point record
        await prisma.trustPoint.create({
            data: {
                user_id: user.id,
                points: Math.abs(points),
                reason,
                status,
            },
        });

        // Update credit score (negative increment)
        await prisma.creditScore.update({
            where: { user_id: user.id },
            data: { score: { increment: points } },
        });

        return NextResponse.json({
            triggeredPunishment: true,
            pointsAwarded: points,
            reason,
            status,
        });
    }

    return NextResponse.json({
        triggeredPunishment: false,
    });
}