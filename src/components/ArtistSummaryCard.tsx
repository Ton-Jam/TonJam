import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import * as RechartsPrimitive from 'recharts';
import { TrendingUp, Gem, Gavel } from 'lucide-react';

const { AreaChart, Area, ResponsiveContainer } = RechartsPrimitive as any;

interface ArtistSummaryCardProps {
  artist: any;
}

export const ArtistSummaryCard: React.FC<ArtistSummaryCardProps> = ({ artist }) => {
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      followers: Math.floor((artist.followers || 100) * 0.9 + Math.random() * ((artist.followers || 100) * 0.1)),
    }));
  }, [artist.followers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <Card className="bg-[#18181b]/40 border-zinc-500/20">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-full">
            <Gem className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Total Sales</p>
            <p className="text-2xl font-black text-white">{artist.totalSales || '84.5'} TON</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-[#18181b]/40 border-zinc-500/20">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <Gavel className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Active Auctions</p>
            <p className="text-2xl font-black text-white">{artist.activeAuctions || '3'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#18181b]/40 border-zinc-500/20 p-4">
        <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Follower Growth</p>
            </div>
        </div>
        <div className="h-[60px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area type="monotone" dataKey="followers" stroke="#34d399" fillOpacity={0.3} fill="#34d399" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
