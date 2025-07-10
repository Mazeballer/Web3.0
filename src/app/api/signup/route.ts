import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role for server-side uploads
);

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Extract all fields
        const firstName = data.firstName as string;
        const lastName = data.lastName as string;
        const email = data.email as string;
        const dob = data.dob as string;
        const phone = data.phone as string;
        const password = data.password as string;
        const address = data.address as string;
        const idType = data.idType as string;
        const idNumber = data.idNumber as string;
        const occupation = data.occupation as string;
        const employer = data.employer as string;
        const income = data.income as string;
        const fundsSource = data.fundsSource as string;
        const investmentExp = data.investmentExp as string;
        const riskTolerance = data.riskTolerance as string;
        const agree = data.agree === true || data.agree === "true"; // handle boolean or string "true"
        const googleSignin = data.google_signin === true || data.google_signin === "true";

        const idFile = data.idFile as string; // ❗ If sending as URL, else handle separately

        // Check for existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists." },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in Prisma
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
                google_signin: googleSignin, // set true if signup with Google
            },
        });

        // Create an initial credit score entry (default to 600 or any other value you prefer)
        await prisma.creditScore.create({
            data: {
                user_id: user.id,  // Use the user's ID here
                score: 0,           // Default score for new users
                computed_at: new Date(),
            },
        });

        return NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Server error during signup" },
            { status: 500 }
        );
    }
}
