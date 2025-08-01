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

    await prisma.user.update({
      where: { email },
      data: { verified: true },
    });

    return NextResponse.json({ status: "verified" }, { status: 200 });
  } catch (err) {
    console.error("❌ Email verification failed:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
