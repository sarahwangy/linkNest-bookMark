"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TagWordCloudProps {
  words: { text: string; value: number }[];
}

const COLORS = ["#7c3aed", "#2563eb", "#16a34a", "#ea580c", "#db2777", "#0891b2", "#d97706"];

export function TagWordCloud({ words }: TagWordCloudProps) {
  const safe = words?.length ? words : [];
  const max = Math.max(...safe.map((w) => w.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Tags</CardTitle>
      </CardHeader>
      <CardContent>
        {safe.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tags yet</p>
        ) : (
          <div className="flex flex-wrap gap-2 items-center" style={{ minHeight: 120 }}>
            {safe.map((w, i) => {
              const size = 11 + Math.round((w.value / max) * 20);
              return (
                <span
                  key={w.text}
                  style={{ fontSize: size, color: COLORS[i % COLORS.length], lineHeight: 1.3 }}
                  className="font-medium select-none"
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
