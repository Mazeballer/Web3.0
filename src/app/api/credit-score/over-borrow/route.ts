import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
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

    const penalty = -25; // for credit score update
    const reason = "Over-borrowing";
    const status = "punishment";

    // Add trust point record (positive number for display)
    await prisma.trustPoint.create({
        data: {
            user_id: user.id,
            points: Math.abs(penalty), // positive in table
            reason,
            status,
        },
    });

    // Update credit score (negative)
    await prisma.creditScore.update({
        where: { user_id: user.id },
        data: { score: { increment: penalty } },
    });

    return NextResponse.json({
        success: true,
        pointsAwarded: Math.abs(penalty),
        reason,
        status,
    });
}