"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
const { Area, AreaChart, CartesianGrid, XAxis, YAxis } = RechartsPrimitive as any

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
  price: {
    label: "Floor Price",
    color: "#f59e0b", // amber-500
  },
} satisfies ChartConfig

interface Props {
  data: { date: string; price: number }[];
  title?: string;
}

export function FloorPriceChart({ data, title = "Floor Price Analytics" }: Props) {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-black uppercase text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-video h-[200px] w-full"
        >
          <AreaChart data={data}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={false} axisLine={false} />
            <YAxis tick={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" className="bg-background border-border text-foreground" />} />
            <Area
              dataKey="price"
              type="monotone"
              fill="url(#fillPrice)"
              stroke="var(--color-price)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
