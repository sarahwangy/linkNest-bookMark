import { NextRequest, NextResponse } from "next/server";
import { requireToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeUrl } from "@/lib/url";
import { inngest } from "@/lib/inngest";

interface BookmarkInput {
  url: string;
  title: string;
  folder?: string;
  addDate: string;
}

interface SyncBody {
  account: string;
  browser?: string;
  bookmarks: BookmarkInput[];
  deletedIds?: string[];
  mode: "full" | "incremental";
  syncedAt: string;
}

export async function POST(req: NextRequest) {
  const userId = await requireToken(req.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SyncBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { account: accountLabel, browser = "chrome", bookmarks, deletedIds = [], mode } = body;

  if (!accountLabel) {
    return NextResponse.json({ error: "account is required" }, { status: 400 });
  }
  if (!Array.isArray(bookmarks)) {
    return NextResponse.json({ error: "bookmarks must be an array" }, { status: 400 });
  }
  if (bookmarks.length > 500) {
    return NextResponse.json({ error: "Max 500 bookmarks per request" }, { status: 413 });
  }

  // Upsert account
  const account = await db.account.upsert({
    where: { userId_label: { userId, label: accountLabel } },
    update: { lastSyncAt: new Date() },
    create: { userId, label: accountLabel, browser, lastSyncAt: new Date() },
  });

  let added = 0;
  let updated = 0;
  let deleted = 0;

  // Upsert bookmarks
  const incomingNormalized = new Set<string>();

  for (const bm of bookmarks) {
    if (!bm.url || !bm.title) continue;

    let urlNormalized: string;
    try {
      urlNormalized = normalizeUrl(bm.url);
    } catch {
      continue;
    }
    incomingNormalized.add(urlNormalized);

    const existing = await db.bookmark.findFirst({
      where: { accountId: account.id, urlNormalized },
    });

    if (existing) {
      await db.bookmark.update({
        where: { id: existing.id },
        data: {
          title: bm.title,
          folder: bm.folder ?? null,
          deletedAt: null,
        },
      });
      updated++;
    } else {
      const created = await db.bookmark.create({
        data: {
          userId,
          accountId: account.id,
          url: bm.url,
          urlNormalized,
          title: bm.title,
          folder: bm.folder ?? null,
          addDate: new Date(bm.addDate),
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(bm.url).hostname}&sz=64`,
        },
      });
      added++;

      await inngest.send({
        name: "bookmark.created",
        data: { bookmarkId: created.id, url: bm.url },
      });
    }
  }

  // Handle deletions
  if (mode === "full") {
    const result = await db.bookmark.updateMany({
      where: {
        accountId: account.id,
        urlNormalized: { notIn: Array.from(incomingNormalized) },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
    deleted += result.count;
  } else if (deletedIds.length > 0) {
    for (const urlNorm of deletedIds) {
      const result = await db.bookmark.updateMany({
        where: { accountId: account.id, urlNormalized: normalizeUrl(urlNorm), deletedAt: null },
        data: { deletedAt: new Date() },
      });
      deleted += result.count;
    }
  }

  // Record sync event
  await db.syncEvent.create({
    data: {
      userId,
      accountId: account.id,
      mode,
      itemsAdded: added,
      itemsUpdated: updated,
      itemsDeleted: deleted,
      status: "success",
      syncedAt: new Date(),
    },
  });

  return NextResponse.json({ added, updated, deleted });
}
