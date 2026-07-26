"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
const { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } = RechartsPrimitive as any

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTonPrice } from "@/contexts/TonPriceContext"

interface PricePoint {
  time: string;
  price: number;
}

export function TonPriceChart() {
  const { price } = useTonPrice();
  const [history, setHistory] = React.useState<PricePoint[]>([]);

  React.useEffect(() => {
    if (price !== null) {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}`;
      
      setHistory(prev => {
        const newHistory = [...prev, { time: timeStr, price }];
        // Keep only last 20 points
        return newHistory.slice(-20);
      });
    }
  }, [price]);

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-black uppercase text-foreground">TON Price Trend</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Line
                dataKey="price"
                type="monotone"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
