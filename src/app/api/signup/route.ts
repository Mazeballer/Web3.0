import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("🔥 Received signup request:", data);

    const {
      firstName,
      lastName,
      email,
      dob,
      phone,
      password,
      address,
      idType,
      idNumber,
      idFile,
      occupation,
      employer,
      income,
      fundsSource,
      investmentExp,
      riskTolerance,
      agree,
      google_signin = false,
    } = data;

    // Step 1: Check duplicates for email, phone, idNumber
    const [existingEmail, existingPhone, existingId] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findFirst({ where: { phone } }),
      prisma.user.findFirst({ where: { id_number: idNumber } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }
    if (existingPhone) {
      return NextResponse.json(
        { message: "Phone number already exists" },
        { status: 400 }
      );
    }
    if (existingId) {
      return NextResponse.json(
        { message: "ID number already exists" },
        { status: 400 }
      );
    }

    // Step 2: Register user with Supabase Auth (only if not Google sign-in)
    if (!google_signin) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName,
              lastName,
            },
            emailRedirectTo: "http://localhost:3000/auth/confirm",
          },
        });

      if (signUpError || !signUpData?.user?.id) {
        return NextResponse.json(
          { message: signUpError?.message || "Signup failed" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Step 3: Save extra user details in Prisma
    const user = await prisma.user.create({
      data: {
        username: email,
        first_name: firstName,
        last_name: lastName,
        email,
        dob: new Date(dob),
        phone,
        password: hashedPassword,
        address,
        id_type: idType,
        id_number: idNumber,
        id_file: idFile,
        occupation,
        employer,
        income,
        funds_source: fundsSource,
        investment_exp: investmentExp,
        risk_tolerance: riskTolerance,
        agree,
        google_signin,
      },
    });

    // Step 4: Create credit score entry
    await prisma.creditScore.create({
      data: {
        user_id: user.id,
        score: 0,
        computed_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Account created. Please check your email to confirm." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Signup API error:", err);
    return NextResponse.json(
      { message: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
