import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireToken } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/openai";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  let userId = session?.user?.id ?? null;

  if (!userId) {
    const authHeader = req.headers.get("authorization");
    userId = await requireToken(authHeader);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const mode = searchParams.get("mode") ?? "keyword";
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (mode === "semantic") {
    return semanticSearch(userId, q, limit);
  }
  return keywordSearch(userId, q, limit);
}

async function keywordSearch(userId: string, q: string, limit: number) {
  const bookmarks = await db.bookmark.findMany({
    where: {
      userId,
      deletedAt: null,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { url: { contains: q, mode: "insensitive" } },
        { ogDescription: { contains: q, mode: "insensitive" } },
        { aiCategory: { contains: q, mode: "insensitive" } },
        { aiTags: { has: q.toLowerCase() } },
      ],
    },
    select: {
      id: true,
      url: true,
      title: true,
      favicon: true,
      ogDescription: true,
      aiCategory: true,
      aiTags: true,
      addDate: true,
      account: { select: { label: true, color: true } },
    },
    orderBy: { addDate: "desc" },
    take: limit,
  });
  return NextResponse.json({ results: bookmarks, mode: "keyword" });
}

async function semanticSearch(userId: string, q: string, limit: number) {
  const embedding = await generateEmbedding(q);
  const vector = `[${embedding.join(",")}]`;

  type Row = {
    id: string;
    url: string;
    title: string;
    favicon: string | null;
    ogDescription: string | null;
    aiCategory: string | null;
    aiTags: string[];
    addDate: Date;
    accountLabel: string;
    accountColor: string | null;
    similarity: number;
  };

  const rows = await db.$queryRaw<Row[]>`
    SELECT
      b.id,
      b.url,
      b.title,
      b.favicon,
      b."ogDescription",
      b."aiCategory",
      b."aiTags",
      b."addDate",
      a.label AS "accountLabel",
      a.color AS "accountColor",
      1 - (be.embedding <=> ${vector}::vector) AS similarity
    FROM "Bookmark" b
    JOIN "BookmarkEmbedding" be ON be."bookmarkId" = b.id
    JOIN "Account" a ON a.id = b."accountId"
    WHERE b."userId" = ${userId}
      AND b."deletedAt" IS NULL
    ORDER BY be.embedding <=> ${vector}::vector
    LIMIT ${Prisma.raw(String(limit))}
  `;

  const results = rows.map((r) => ({
    id: r.id,
    url: r.url,
    title: r.title,
    favicon: r.favicon,
    ogDescription: r.ogDescription,
    aiCategory: r.aiCategory,
    aiTags: r.aiTags,
    addDate: r.addDate,
    account: { label: r.accountLabel, color: r.accountColor },
    similarity: Number(r.similarity),
  }));

  return NextResponse.json({ results, mode: "semantic" });
}
