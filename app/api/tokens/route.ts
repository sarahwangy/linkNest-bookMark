import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes, createHash } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = body?.name?.trim();
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const raw = "lnk_" + randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12);

  const token = await db.apiToken.create({
    data: {
      userId: session.user.id,
      name,
      tokenHash,
      prefix,
    },
  });

  return NextResponse.json({
    id: token.id,
    name: token.name,
    token: raw,
    prefix,
    createdAt: token.createdAt,
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tokens = await db.apiToken.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: {
      id: true,
      name: true,
      prefix: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tokens);
}
