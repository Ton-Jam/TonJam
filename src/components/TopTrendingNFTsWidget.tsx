import React, { useMemo, useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { useNFT } from '@/contexts/NFTContext';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

export const TopTrendingNFTsWidget: React.FC = () => {
  const { nfts } = useNFT();
  const [salesByNft, setSalesByNft] = useState<Record<string, { title: string; volume: number }>>({});

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'nftSales'),
      (snap) => {
        const totals: Record<string, { title: string; volume: number }> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          const key = data.nftId || data.nftTitle || d.id;
          const amount = parseFloat(String(data.price || 0)) || 0;
          if (!totals[key]) {
            totals[key] = { title: data.nftTitle || data.title || 'NFT', volume: 0 };
          }
          totals[key].volume += amount;
        });
        setSalesByNft(totals);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'nftSales');
      }
    );
    return () => unsub();
  }, []);

  const chartData = useMemo(() => {
    const entries = Object.values(salesByNft);
    if (entries.length > 0) {
      return entries
        .map((entry) => ({
          name: entry.title.length > 10 ? entry.title.substring(0, 8) + '...' : entry.title,
          fullTitle: entry.title,
          volume: Number(entry.volume.toFixed(2)),
          color: '#f59e0b',
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);
    }

    return nfts
      .slice(0, 5)
      .map((nft) => ({
        name: nft.title.length > 10 ? nft.title.substring(0, 8) + '...' : nft.title,
        fullTitle: nft.title,
        volume: Number(nft.views || 0),
        color: '#f59e0b',
      }))
      .sort((a, b) => b.volume - a.volume);
  }, [salesByNft, nfts]);

  const hasSales = Object.keys(salesByNft).length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1c1c1e]/90 backdrop-blur-md p-3 rounded-xl shadow-xl">
          <p className="font-bold text-white text-sm mb-1">{data.fullTitle}</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            {payload[0].value.toLocaleString()} {hasSales ? 'TON Volume' : 'Views'}
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
        {chartData.length > 0 ? (
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
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar 
                  dataKey="volume" 
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                >
                  {chartData.map((_, index) => (
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
        ) : (
          <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">
            No trending NFT activity recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
