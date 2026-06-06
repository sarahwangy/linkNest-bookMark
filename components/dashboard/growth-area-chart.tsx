"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GrowthAreaChartProps {
  data: { month: string; count: number }[];
}

export function GrowthAreaChart({ data }: GrowthAreaChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Bookmarks Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} interval={3} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: 8 }} />
            <Area type="monotone" dataKey="count" stroke="#7c3aed" fill="url(#colorCount)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
