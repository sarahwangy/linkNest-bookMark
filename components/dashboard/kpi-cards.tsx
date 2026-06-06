import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Users, TrendingUp, AlertCircle } from "lucide-react";

interface KpiCardsProps {
  totalBookmarks: number;
  activeAccounts: number;
  addedThisMonth: number;
  deadLinks: number;
}

export function KpiCards({ totalBookmarks, activeAccounts, addedThisMonth, deadLinks }: KpiCardsProps) {
  const cards = [
    { title: "Total Bookmarks", value: totalBookmarks.toLocaleString(), icon: Bookmark, color: "text-primary" },
    { title: "Active Accounts", value: activeAccounts.toString(), icon: Users, color: "text-blue-400" },
    { title: "Added This Month", value: `+${addedThisMonth}`, icon: TrendingUp, color: "text-green-400" },
    { title: "Dead Links", value: deadLinks.toString(), icon: AlertCircle, color: "text-red-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ title, value, icon: Icon, color }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
