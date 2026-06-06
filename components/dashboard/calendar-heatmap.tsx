"use client";
import { ResponsiveCalendar } from "@nivo/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarHeatmapProps {
  data: Record<string, number>;
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const calendarData = Object.entries(data).map(([day, value]) => ({ day, value }));
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];
  const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: 160 }}>
          <ResponsiveCalendar
            data={calendarData}
            from={startDate}
            to={endDate}
            emptyColor="#1e293b"
            colors={["#312e81", "#4338ca", "#6d28d9", "#7c3aed"]}
            margin={{ top: 10, right: 10, bottom: 0, left: 20 }}
            yearSpacing={40}
            monthBorderColor="#0f172a"
            dayBorderWidth={2}
            dayBorderColor="#0f172a"
            theme={{
              text: { fill: "#9ca3af", fontSize: 11 },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
