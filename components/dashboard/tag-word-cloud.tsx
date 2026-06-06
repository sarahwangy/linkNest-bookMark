"use client";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WordCloud = dynamic(() => import("react-wordcloud"), { ssr: false });

interface TagWordCloudProps {
  words: { text: string; value: number }[];
}

const options = {
  colors: ["#7c3aed", "#2563eb", "#16a34a", "#ea580c", "#db2777"],
  enableTooltip: false,
  fontFamily: "Inter, sans-serif",
  fontSizes: [12, 40] as [number, number],
  rotations: 0,
  rotationAngles: [0, 0] as [number, number],
};

export function TagWordCloud({ words }: TagWordCloudProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: 200 }}>
          <WordCloud words={words} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
