"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
const { Line, LineChart, CartesianGrid, XAxis, YAxis } = RechartsPrimitive as any

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
  value: {
    label: "Value",
    color: "#a855f7", // purple-500
  },
} satisfies ChartConfig

interface Props {
  data: { date: string; value: number }[];
}

export function NFTChart({ data }: Props) {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-black uppercase text-foreground">NFT Value Trend</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-video h-[200px] w-full"
        >
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={false} axisLine={false} />
            <YAxis tick={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" className="bg-background border-border text-foreground" />} />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
