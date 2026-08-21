"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
const { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } = RechartsPrimitive as any

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { TrendingUp, Activity } from "lucide-react"

const chartConfig = {
  price: {
    label: "Floor Price",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

interface Props {
  data: { date: string; price: number }[];
  title?: string;
  collectionName?: string;
}

export function FloorPriceChart({ data, title = "Floor Price History", collectionName }: Props) {
  const latestPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const initialPrice = data.length > 0 ? data[0].price : 0;
  const percentageChange = initialPrice > 0 ? ((latestPrice - initialPrice) / initialPrice) * 100 : 0;
  const isPositive = percentageChange >= 0;

  return (
    <Card className="border-border-subtle bg-surface/50 overflow-hidden">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold uppercase text-text-muted tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary" />
              {title}
            </CardTitle>
            {collectionName && (
              <CardDescription className="text-[10px] text-text-muted/60 mt-1">
                Data sourced from TON Blockchain (Last 30 Days)
              </CardDescription>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-black tracking-tighter text-text-primary">
              {latestPrice} <span className="text-[10px] text-text-muted font-bold">TON</span>
            </div>
            <div className={`text-[10px] font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-success' : 'text-error'}`}>
              <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
              {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer
          config={chartConfig}
          className="h-[180px] w-full"
        >
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.03)" 
            />
            <XAxis 
              dataKey="date" 
              hide={true}
            />
            <YAxis 
              hide={true}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <ChartTooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              content={
                <ChartTooltipContent 
                  indicator="dot" 
                  className="bg-elevated border-border-subtle"
                  labelFormatter={(value) => `Date: ${value}`}
                  formatter={(value) => [
                    <span className="font-mono">{value} TON</span>,
                    "Floor"
                  ]}
                />
              } 
            />
            <Area
              dataKey="price"
              type="monotone"
              fill="url(#fillPrice)"
              stroke="var(--color-price)"
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "var(--color-price)" }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
