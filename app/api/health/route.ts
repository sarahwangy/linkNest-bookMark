import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Lazy import to avoid module-load errors when DATABASE_URL is unset
    const { db } = await import("@/lib/db");
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch {
    return NextResponse.json(
      { status: "error", db: "disconnected" },
      { status: 503 }
    );
  }
}
