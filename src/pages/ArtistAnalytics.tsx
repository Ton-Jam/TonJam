import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Activity, Coins, Users, Heart } from "lucide-react";
import { FloorPriceChart } from "@/components/FloorPriceChart";
import { StreamingStatsChart } from "@/components/StreamingStatsChart";
import { NFTChart } from "@/components/NFTChart";
import { ArtistAnalyticsChart } from "@/components/ArtistAnalyticsChart";

export default function ArtistAnalytics() {
  const navigate = useNavigate();
  
  // Mock data for charts
  const floorPriceData = [{ date: "May 1", price: 1.2 }, { date: "May 2", price: 1.5 }, { date: "May 3", price: 1.3 }, { date: "May 4", price: 1.8 }];
  const streamingData = [{ day: "Mon", plays: 1200 }, { day: "Tue", plays: 1800 }, { day: "Wed", plays: 1500 }, { day: "Thu", plays: 2200 }];
  const nftData = [{ date: "May 1", value: 100 }, { date: "May 2", value: 120 }, { date: "May 3", value: 110 }, { date: "May 4", value: 150 }];
  const performanceData = [{ subject: 'Reach', A: 80 }, { subject: 'Sales', A: 70 }, { subject: 'Growth', A: 90 }, { subject: 'Engagement', A: 85 }];
  
  // Metric summary data
  const metrics = [
    { title: "Total Streams", value: "124,500", sub: "+12.4% vs last week", icon: Activity },
    { title: "NFT Revenue", value: "48.2 TON", sub: "+5.1% vs last week", icon: Coins },
    { title: "Unique Listeners", value: "8,230", sub: "+2.3% vs last week", icon: Users },
    { title: "Fan Engagement", value: "14,200", sub: "+8.9% vs last week", icon: Heart },
  ];

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
          <h2 className="text-2xl font-black uppercase tracking-tighter">TonJam Insights</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Monitor your artifact performance, streaming stats, and protocol revenue</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
             <div key={i} className="bg-card p-6 rounded-3xl border border-border flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{m.title}</h4>
                   <m.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-3xl font-black mt-4">{m.value}</p>
                <p className="text-[10px] font-bold text-emerald-500 mt-1">{m.sub}</p>
             </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FloorPriceChart data={floorPriceData} />
          <StreamingStatsChart data={streamingData} />
          <NFTChart data={nftData} />
          <ArtistAnalyticsChart data={performanceData} />
        </div>
      </div>
    </div>
  );
}
