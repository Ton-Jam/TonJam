"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
const { Bar, BarChart, CartesianGrid, XAxis } = RechartsPrimitive as any

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
  plays: {
    label: "Plays",
    color: "#60a5fa", // blue-400
  },
} satisfies ChartConfig

interface Props {
  data: { day: string; plays: number }[];
}

export function StreamingStatsChart({ data }: Props) {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-black uppercase text-foreground">Streaming Stats</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-video h-[200px] w-full"
        >
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="dashed" className="bg-background border-border text-foreground" />} />
            <Bar
              dataKey="plays"
              fill="var(--color-plays)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
