import { getLendingPools } from "@/lib/lendingPools";

export async function GET() {
    const data = await getLendingPools();
    return Response.json(data);
}