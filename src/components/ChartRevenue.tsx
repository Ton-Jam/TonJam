"use client"

import * as React from "react"
import { useEffect, useState } from "react"
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
import { getArtistRevenueBreakdown, MonthlyRevenue } from "@/services/analyticsService"
import { auth } from "@/lib/firebase"

const chartConfig = {
  streaming: {
    label: "Streaming",
    color: "#2563eb", // blue-600
  },
  nft: {
    label: "Sales Rev",
    color: "#d97706", // amber-600
  },
} satisfies ChartConfig

export function ChartRevenue() {
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRevenue = async () => {
      const user = auth.currentUser
      if (user) {
        const breakdown = await getArtistRevenueBreakdown(user.uid)
        setData(breakdown)
      }
      setIsLoading(false)
    }

    fetchRevenue()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-neutral-500/10 bg-foreground/[0.02] text-foreground h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </Card>
    )
  }

  return (
    <Card className="border-neutral-500/10 bg-foreground/[0.02] text-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Revenue Breakdown</CardTitle>
        <CardDescription className="text-muted-foreground">Monthly revenue analysis (TON)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
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
            {/* @ts-ignore */}
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
