// src/app/api/verify-email/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email;

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    console.log("🔍 Looking for email:", email);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.verified) {
      return NextResponse.json({ status: "already" }, { status: 200 });
    }

    // 1️⃣ Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { verified: true },
    });

    // 2️⃣ Award trust points (+20)
    const bonus = 20;
    const reason = "Verified identity (KYC)";
    const status = "reward";

    await prisma.trustPoint.create({
      data: {
        user_id: user.id,
        points: bonus, // store as positive
        reason,
        status,
      },
    });

    // 3️⃣ Increase credit score by 20
    await prisma.creditScore.update({
      where: { user_id: user.id },
      data: { score: { increment: bonus } },
    });

    return NextResponse.json({ status: "verified", bonus }, { status: 200 });
  } catch (err) {
    console.error("❌ Email verification failed:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
