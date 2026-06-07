import { NextRequest, NextResponse } from "next/server";
import { requireToken } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await requireToken(req.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountLabel = searchParams.get("account");

  const where = accountLabel
    ? { userId, account: { label: accountLabel } }
    : { userId };

  const events = await db.syncEvent.findMany({
    where,
    orderBy: { syncedAt: "desc" },
    take: 10,
    include: { account: { select: { label: true, browser: true } } },
  });

  const total = events.length;
  const successful = events.filter((e) => e.status === "success").length;

  return NextResponse.json({ events, successRate: total > 0 ? successful / total : null });
}
