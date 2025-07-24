import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const email = session?.user?.email;

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch all reward/punishment records for this user
        const records = await prisma.trustPoint.findMany({
            where: {
                user_id: user.id,
            },
            select: {
                reason: true,
                points: true,
                status: true,
                awarded_at: true,
            },
            orderBy: {
                awarded_at: "desc",
            },
        });

        console.log("Records: ", records)

        return NextResponse.json(records);
    } catch (err) {
        console.error("[API] /api/credit-score/score-breakdown error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}