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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">All your bookmarks, in one place</p>
      </div>

      <KpiCards {...MOCK_KPI} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AccountBarChart data={MOCK_ACCOUNT_DISTRIBUTION} />
        <CategoryPieChart data={MOCK_CATEGORY_DISTRIBUTION} />
        <GrowthAreaChart data={MOCK_GROWTH} />
        <CalendarHeatmap data={MOCK_CALENDAR_DATA} />
        <TagWordCloud words={MOCK_TAGS} />
      </div>
    </div>
  );
}
