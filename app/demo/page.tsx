import Link from "next/link";
import { db } from "@/lib/db";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { AccountBarChart } from "@/components/dashboard/account-bar-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { GrowthAreaChart } from "@/components/dashboard/growth-area-chart";
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { TagWordCloud } from "@/components/dashboard/tag-word-cloud";
import {
  MOCK_KPI,
  MOCK_ACCOUNT_DISTRIBUTION,
  MOCK_CATEGORY_DISTRIBUTION,
  MOCK_GROWTH,
  MOCK_TAGS,
  MOCK_CALENDAR_DATA,
} from "@/data/seed-constants";

const DEMO_EMAIL = "demo@linknest.app";
const ACCOUNT_COLORS = ["#7c3aed", "#2563eb", "#ea580c", "#16a34a", "#db2777"];

async function getDemoData() {
  const user = await db.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });
  if (!user) return null;

  const userId = user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [totalBookmarks, addedThisMonth, deadLinks, accounts, categories, recentBookmarks] =
    await Promise.all([
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
        select: { addDate: true, aiTags: true },
        orderBy: { addDate: "asc" },
      }),
    ]);

  const monthCounts: Record<string, number> = {};
  const calendarData: Record<string, number> = {};
  for (const bm of recentBookmarks) {
    const monthKey = bm.addDate.toISOString().slice(0, 7);
    monthCounts[monthKey] = (monthCounts[monthKey] ?? 0) + 1;
    const dayKey = bm.addDate.toISOString().split("T")[0];
    calendarData[dayKey] = (calendarData[dayKey] ?? 0) + 1;
  }
  const growth = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const tagCounts: Record<string, number> = {};
  for (const bm of recentBookmarks) {
    for (const tag of bm.aiTags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const tags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([text, value]) => ({ text, value }));

  return {
    kpi: { totalBookmarks, activeAccounts: accounts.length, addedThisMonth, deadLinks },
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
    calendarData,
  };
}

export default async function DemoPage() {
  const data = await getDemoData().catch(() => null);

  const kpi = data?.kpi ?? MOCK_KPI;
  const accountDistribution = data?.accountDistribution ?? MOCK_ACCOUNT_DISTRIBUTION;
  const categoryDistribution =
    data?.categoryDistribution && data.categoryDistribution.length > 0
      ? data.categoryDistribution
      : MOCK_CATEGORY_DISTRIBUTION;
  const growth = data?.growth && data.growth.length > 0 ? data.growth : MOCK_GROWTH;
  const tags = data?.tags && data.tags.length > 0 ? data.tags : MOCK_TAGS;
  const calendarData =
    data?.calendarData && Object.keys(data.calendarData).length > 0
      ? data.calendarData
      : MOCK_CALENDAR_DATA;

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="border-b border-border bg-muted/50">
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              Demo
            </span>
            This is a read-only preview with sample bookmark data
          </div>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign up free
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted"
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">All your bookmarks, in one place</p>
        </div>

        <KpiCards {...kpi} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AccountBarChart data={accountDistribution} />
          <CategoryPieChart data={categoryDistribution} />
          <GrowthAreaChart data={growth} />
          <CalendarHeatmap data={calendarData} />
          <TagWordCloud words={tags} />
        </div>
      </div>
    </div>
  );
}
