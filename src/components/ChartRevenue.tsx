"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
const { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis,
  ResponsiveContainer 
} = RechartsPrimitive as any

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A stacked bar chart with a legend"

const chartData = [
  { month: "January", streaming: 186, nft: 80 },
  { month: "February", streaming: 305, nft: 200 },
  { month: "March", streaming: 237, nft: 120 },
  { month: "April", streaming: 73, nft: 190 },
  { month: "May", streaming: 209, nft: 130 },
  { month: "June", streaming: 214, nft: 140 },
]

const chartConfig = {
  streaming: {
    label: "Streaming",
    color: "#2563eb", // blue-600
  },
  nft: {
    label: "NFT Sales",
    color: "#d97706", // amber-600
  },
} satisfies ChartConfig

export function ChartRevenue() {
  return (
    <Card className="border-neutral-500/10 bg-foreground/[0.02] text-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Revenue Breakdown</CardTitle>
        <CardDescription className="text-muted-foreground">Monthly revenue from Streaming vs NFT Sales</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke="rgba(255,255,255,0.4)"
            />
            <ChartTooltip 
                content={<ChartTooltipContent hideLabel className="bg-background border-border text-foreground" />} 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
            />
            <ChartLegend content={<ChartLegendContent className="text-muted-foreground/80" />} />
            <Bar
              dataKey="streaming"
              stackId="a"
              fill="var(--color-streaming)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="nft"
              stackId="a"
              fill="var(--color-nft)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
