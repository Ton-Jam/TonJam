"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
const { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } = RechartsPrimitive as any

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  score: {
    label: "Score",
    color: "#22c55e", // green-500
  },
} satisfies ChartConfig

interface Props {
  data: { subject: string; A: number }[];
}

export function ArtistAnalyticsChart({ data }: Props) {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-black uppercase text-foreground">Artist Performance</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-square h-[200px] w-full"
        >
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{fill: "var(--foreground)", fontSize: 10}} />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" className="bg-background border-border text-foreground" />} />
            <Radar
              name="Score"
              dataKey="A"
              stroke="var(--color-score)"
              fill="var(--color-score)"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
