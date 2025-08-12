// app/api/check-overdue/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust to your auth config
import { prisma } from "@/lib/prisma"; // adjust to your prisma instance
import { addMonths, isAfter } from "date-fns";

export async function POST() {
    try {
        // 1️⃣ Get logged-in user session
        const session = await getServerSession(authOptions);
        const email = session?.user?.email;
        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2️⃣ Get user id
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3️⃣ Get active borrows for this user (exclude completed & late)
        const activeBorrows = await prisma.borrow.findMany({
            where: {
                user_id: user.id,
                status: "active",
            },
            select: {
                id: true,
                borrowed_at: true,
                borrow_duration: true,
            },
        });

        // 4️⃣ Check overdue and update status
        let updatedCount = 0;
        for (const borrow of activeBorrows) {
            const dueDate = addMonths(borrow.borrowed_at, Number(borrow.borrow_duration || 0));

            if (isAfter(new Date(), dueDate)) {
                await prisma.borrow.update({
                    where: { id: borrow.id },
                    data: { status: "late" },
                });
                updatedCount++;
            }
        }

        return NextResponse.json({
            message: "Overdue check completed",
            updated: updatedCount,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
