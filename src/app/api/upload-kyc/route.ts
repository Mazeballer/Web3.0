// app/api/upload-kyc/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const email = formData.get("email") as string;

        if (!file || !email) {
            return NextResponse.json({ message: "Missing file or email" }, { status: 400 });
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `kyc/${Date.now()}-${email}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from("kyc-documents")
            .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (error) {
            console.error(error);
            return NextResponse.json({ message: "Upload failed" }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage
            .from("kyc-documents")
            .getPublicUrl(fileName);

        return NextResponse.json({ publicUrl: publicUrlData.publicUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Server error during upload" }, { status: 500 });
    }
}
