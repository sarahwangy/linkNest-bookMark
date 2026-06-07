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
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getDashboardData(userId: string) {
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
  for (const bm of recentBookmarks) {
    const key = bm.addDate.toISOString().slice(0, 7);
    monthCounts[key] = (monthCounts[key] ?? 0) + 1;
  }
  const growth = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const calendarData: Record<string, number> = {};
  for (const bm of recentBookmarks) {
    const day = bm.addDate.toISOString().split("T")[0];
    calendarData[day] = (calendarData[day] ?? 0) + 1;
  }

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

  const COLORS = ["#7c3aed", "#2563eb", "#ea580c", "#16a34a", "#db2777"];

  return {
    kpi: { totalBookmarks, activeAccounts: accounts.length, addedThisMonth, deadLinks },
    accountDistribution: accounts.map((a, i) => ({
      account: a.label,
      count: a._count.bookmarks,
      color: a.color ?? COLORS[i % COLORS.length],
    })),
    categoryDistribution: categories.map((c, i) => ({
      name: c.aiCategory ?? "Other",
      value: c._count.aiCategory,
      color: COLORS[i % COLORS.length],
    })),
    growth,
    tags,
    calendarData,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  let kpi = MOCK_KPI;
  let accountDistribution = MOCK_ACCOUNT_DISTRIBUTION;
  let categoryDistribution = MOCK_CATEGORY_DISTRIBUTION;
  let growth = MOCK_GROWTH;
  let tags = MOCK_TAGS;
  let calendarData = MOCK_CALENDAR_DATA;

  if (session?.user?.id) {
    try {
      const data = await getDashboardData(session.user.id);
      if (data.kpi.totalBookmarks > 0) {
        kpi = data.kpi;
        accountDistribution = data.accountDistribution;
        categoryDistribution = data.categoryDistribution.length > 0
          ? data.categoryDistribution
          : MOCK_CATEGORY_DISTRIBUTION;
        growth = data.growth.length > 0 ? data.growth : MOCK_GROWTH;
        tags = data.tags.length > 0 ? data.tags : MOCK_TAGS;
        calendarData = Object.keys(data.calendarData).length > 0
          ? data.calendarData
          : MOCK_CALENDAR_DATA;
      }
    } catch {
      // DB not connected yet — use mock data silently
    }
  }

  return (
    <div className="space-y-6">
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
  );
}
