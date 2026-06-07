import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [
    totalBookmarks,
    addedThisMonth,
    deadLinks,
    accounts,
    categories,
    recentBookmarks,
  ] = await Promise.all([
    db.bookmark.count({ where: { userId, deletedAt: null } }),
    db.bookmark.count({ where: { userId, deletedAt: null, addDate: { gte: startOfMonth } } }),
    db.bookmark.count({ where: { userId, deletedAt: null, isDead: true } }),
    db.account.findMany({
      where: { userId },
      include: { _count: { select: { bookmarks: { where: { deletedAt: null } } } } },
    }),
    db.bookmark.groupBy({
      by: ["aiCategory"],
      where: { userId, deletedAt: null, aiCategory: { not: null } },
      _count: { aiCategory: true },
      orderBy: { _count: { aiCategory: "desc" } },
      take: 10,
    }),
    db.bookmark.findMany({
      where: { userId, deletedAt: null, addDate: { gte: oneYearAgo } },
      select: { addDate: true },
      orderBy: { addDate: "asc" },
    }),
  ]);

  const monthCounts: Record<string, number> = {};
  for (const bm of recentBookmarks) {
    const key = bm.addDate.toISOString().slice(0, 7);
    monthCounts[key] = (monthCounts[key] ?? 0) + 1;
  }
  const growth = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const calendarCounts: Record<string, number> = {};
  for (const bm of recentBookmarks) {
    const day = bm.addDate.toISOString().split("T")[0];
    calendarCounts[day] = (calendarCounts[day] ?? 0) + 1;
  }

  const allBookmarksWithTags = await db.bookmark.findMany({
    where: { userId, deletedAt: null, aiTags: { isEmpty: false } },
    select: { aiTags: true },
  });
  const tagCounts: Record<string, number> = {};
  for (const bm of allBookmarksWithTags) {
    for (const tag of bm.aiTags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const tags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([text, value]) => ({ text, value }));

  const ACCOUNT_COLORS = ["#7c3aed", "#2563eb", "#ea580c", "#16a34a", "#db2777"];

  return NextResponse.json({
    kpi: {
      totalBookmarks,
      activeAccounts: accounts.length,
      addedThisMonth,
      deadLinks,
    },
    accountDistribution: accounts.map((a, i) => ({
      account: a.label,
      count: a._count.bookmarks,
      color: a.color ?? ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
    })),
    categoryDistribution: categories.map((c, i) => ({
      name: c.aiCategory ?? "Other",
      value: c._count.aiCategory,
      color: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
    })),
    growth,
    tags,
    calendarData: calendarCounts,
  });
}
