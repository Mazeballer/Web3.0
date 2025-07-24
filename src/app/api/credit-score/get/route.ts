import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"; // ✅ Still works
import { authOptions } from "@/lib/auth";      // ✅ Same auth options

export async function GET() {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
        return NextResponse.json({ score: 0 }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ score: 0 }, { status: 404 });
        }

        const credit = await prisma.creditScore.findUnique({
            where: { user_id: user.id },
            select: { score: true },
        });

        console.log("Credit: ", credit)

        return NextResponse.json({ score: credit?.score ?? 0 });
    } catch (err) {
        console.error("Credit Score Error:", err);
        return NextResponse.json({ score: 0 }, { status: 500 });
    }
}
