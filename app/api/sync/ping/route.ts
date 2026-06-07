import { NextRequest, NextResponse } from "next/server";
import { requireToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await requireToken(req.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, userId });
}
