// ✅ /app/api/reset/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1️⃣ Find the user by email
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

    if (listError) {
      return NextResponse.json({ message: listError.message }, { status: 500 });
    }

    const user = users?.users?.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 2️⃣ Update the password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
