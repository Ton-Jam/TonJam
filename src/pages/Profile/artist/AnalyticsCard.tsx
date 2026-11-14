import React, { useMemo } from 'react';
import {
  ResponsiveContainer as RechartsResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { TrendingUp, Play } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';

const ResponsiveContainer = RechartsResponsiveContainer as any;
const AreaChart = RechartsAreaChart as any;
const Area = RechartsArea as any;
const XAxis = RechartsXAxis as any;
const YAxis = RechartsYAxis as any;
const Tooltip = RechartsTooltip as any;

interface AnalyticsCardProps {
  artistName: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ artistName }) => {
  const { allTracks, transactions } = useAudio();

  const { chartData, totalPlays } = useMemo(() => {
    const matchingTracks = (allTracks || []).filter(
      (t) => !artistName || t.artist?.toLowerCase() === artistName.toLowerCase()
    );
    const total = matchingTracks.reduce(
      (sum, t) => sum + Number(t.playCount || t.streams || 0),
      0
    );

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayCounts = new Map<string, number>();
    days.forEach((d) => dayCounts.set(d, 0));

    (transactions || []).forEach((tx) => {
      if (tx.type === 'stream' && tx.timestamp) {
        const d = new Date(tx.timestamp);
        if (!isNaN(d.getTime())) {
          const dayIdx = (d.getDay() + 6) % 7;
          const label = days[dayIdx];
          dayCounts.set(label, (dayCounts.get(label) || 0) + 1);
        }
      }
    });

    const data = days.map((date) => ({
      date,
      plays: dayCounts.get(date) || 0,
    }));

    return { chartData: data, totalPlays: total };
  }, [allTracks, transactions, artistName]);

  return (
    <div className="bg-[#101A3B] rounded-2xl p-5 text-white flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Realtime Streaming Stats
          </span>
          <h4 className="text-sm font-bold text-slate-200 mt-0.5">Listener Waveforms</h4>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Live</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black font-mono tracking-tight text-white">
            {totalPlays.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-slate-400 flex items-center gap-0.5 uppercase tracking-wide">
            <Play className="w-3 h-3 text-[#0052FF] fill-current" />
            Total Plays
          </span>
        </div>
      </div>

      <div className="h-44 w-full mt-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <defs>
              <linearGradient id="playsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0052FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0052FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              fontFamily="monospace"
            />
            <YAxis
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              fontFamily="monospace"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#050A24',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
              itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Area
              type="monotone"
              dataKey="plays"
              stroke="#0052FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#playsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCard;
