"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getArtifactPerformance, ArtifactPerformance } from "@/services/analyticsService"
import { auth } from "@/lib/firebase"

export function ChartArtifacts() {
  const [data, setData] = useState<ArtifactPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPerformance = async () => {
      const user = auth.currentUser
      if (user) {
        const performance = await getArtifactPerformance(user.uid)
        setData(performance)
      }
      setIsLoading(false)
    }

    fetchPerformance()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-neutral-500/10 bg-foreground/[0.02] text-foreground h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </Card>
    )
  }

  return (
    <Card className="border-neutral-500/10 bg-foreground/[0.02] text-foreground h-full">
      <CardHeader>
        <CardTitle className="text-foreground">Artifact Performance</CardTitle>
        <CardDescription className="text-muted-foreground">Streams and Sales per Track</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-auto h-[250px] w-full">
          {/* @ts-ignore */}
          <ResponsiveContainer width="100%" height="100%">
            {/* @ts-ignore */}
            <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              {/* @ts-ignore */}
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10} 
                tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + '...' : value}
                stroke="rgba(255,255,255,0.4)" 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
              />
              {/* @ts-ignore */}
              <Legend wrapperStyle={{ paddingTop: '20px', opacity: 0.8 }} />
              {/* @ts-ignore */}
              <Bar dataKey="streams" name="Streams" fill="#10b981" radius={[4, 4, 0, 0]} />
              {/* @ts-ignore */}
              <Bar dataKey="sales" name="Sales" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
