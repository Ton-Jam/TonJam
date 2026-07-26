import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { useAudio } from '@/contexts/AudioContext';
import { MOCK_TRACKS } from '@/constants';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TopTrendingNFTsWidget: React.FC = () => {
  const { allTracks } = useAudio();

  const chartData = useMemo(() => {
    const sourceTracks = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    
    // Generate deterministic mock volume based on track id for visual consistency
    return sourceTracks.slice(0, 5).map((track, i) => {
      const seed = track.title.length * (i + 1);
      return {
        name: track.title.length > 10 ? track.title.substring(0, 8) + '...' : track.title,
        fullTitle: track.title,
        volume: 5000 + (seed * 342) % 15000,
        color: '#f59e0b', // Amber/Yellow accent for trending
      };
    }).sort((a, b) => b.volume - a.volume);
  }, [allTracks]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1c1c1e]/90 border border-white/10 backdrop-blur-md p-3 rounded-xl shadow-xl">
          <p className="font-bold text-white text-sm mb-1">{data.fullTitle}</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            {payload[0].value.toLocaleString()} Volume
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1c1c1e]/40 p-6 rounded-2xl shadow-sm border-0">
      <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Top Trending NFTs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar 
                dataKey="volume" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill="#f59e0b" 
                    fillOpacity={0.7 + (index * 0.05)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
