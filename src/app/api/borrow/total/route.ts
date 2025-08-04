import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust if needed
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
        return NextResponse.json({ totalBorrowed: 0 }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ totalBorrowed: 0 }, { status: 404 });
    }

    const borrowings = await prisma.borrow.findMany({
        where: {
            user_id: user.id,
            status: { in: ["active", "late"] },
        },
        select: { amount: true },
    });

    const totalBorrowed = borrowings.reduce(
        (sum, b) => sum + parseFloat(b.amount),
        0
    );

    return NextResponse.json({ totalBorrowed });
}