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
    <Card className="border-0 bg-[var(--tj-color-surface-elevated,#111F36)]/60 rounded-[var(--tj-radius-md,8px)] shadow-none">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--tj-color-text-secondary,#C2C7CD)]">
          Price History
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {data && data.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-video h-[200px] w-full"
          >
            <LineChart data={data}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={false} axisLine={false} />
              <YAxis tick={false} axisLine={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 text-white shadow-lg"
                  />
                }
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="#00B4D8"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[140px] flex items-center justify-center text-center text-xs text-[var(--tj-color-text-secondary,#C2C7CD)]">
            No completed sales history recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
