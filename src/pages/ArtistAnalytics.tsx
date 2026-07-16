import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Activity, Coins, Users, Heart } from "lucide-react";
import ArtistRevenueDashboard from "@/components/ArtistRevenueDashboard";

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

      <div className="relative z-10 w-full max-w-full p-4 sm:p-8 space-y-8 mt-4">
        <ArtistRevenueDashboard />
      </div>
    </div>
  );
}
