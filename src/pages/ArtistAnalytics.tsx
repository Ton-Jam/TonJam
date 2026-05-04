import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Activity, TrendingUp, BarChart2, Coins } from "lucide-react";
import { ChartAreaInteractive } from "@/components/ChartAreaInteractive";
import { ChartRevenue } from "@/components/ChartRevenue";
import { ChartArtifacts } from "@/components/ChartArtifacts";

export default function ArtistAnalytics() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 opacity-10 blur-[120px] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0">
        <BackButton className="p-2 text-muted-foreground hover:text-foreground transition-colors" />
        <h1 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Analytics
        </h1>
        <div className="w-8" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 space-y-8 mt-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Data Insights</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Monitor your artifact performance and protocol revenue</p>
        </div>

        {/* Popularity Trends */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Popularity Trends
          </h3>
          <div className="glass p-1 rounded-xl">
             <ChartAreaInteractive />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Revenue Breakdown
            </h3>
            <div className="glass p-1 rounded-xl">
               <ChartRevenue />
            </div>
          </section>

          {/* Performance of Artifacts */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Artifact Performance
            </h3>
            <div className="glass p-1 rounded-xl">
              <ChartArtifacts />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
