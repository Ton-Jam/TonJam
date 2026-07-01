import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Music, 
  Upload, 
  Gem, 
  Award, 
  Users, 
  Sparkles, 
  Heart,
  BarChart2,
  ListPlus,
  Coins
} from 'lucide-react';
// Custom lightweight premium inline SVG Area Chart


interface ArtistDashboardCardProps {
  onUploadTrack: () => void;
  onMintNFT: () => void;
  onOpenAnalytics: () => void;
}

const STREAMS_DATA = [
  { day: 'Mon', streams: 1200 },
  { day: 'Tue', streams: 1800 },
  { day: 'Wed', streams: 2400 },
  { day: 'Thu', streams: 2200 },
  { day: 'Fri', streams: 3100 },
  { day: 'Sat', streams: 4500 },
  { day: 'Sun', streams: 5200 },
];

const TOP_SONGS = [
  { title: 'Supersonic Frequencies', streams: 124500, royalties: '124.5 TON' },
  { title: 'Midnight Grid Runner', streams: 84300, royalties: '84.3 TON' },
  { title: 'Deep Cyber Bass', streams: 32100, royalties: '32.1 TON' }
];

const RECENT_SALES = [
  { nftName: 'Sonic Resonance #04', buyer: '@ton_whale', price: '15.0 TON', time: '2h ago' },
  { nftName: 'Sonic Resonance #02', buyer: '@krupy_fan', price: '15.0 TON', time: '1d ago' },
];

export const ArtistDashboardCard: React.FC<ArtistDashboardCardProps> = ({
  onUploadTrack,
  onMintNFT,
  onOpenAnalytics
}) => {
  return (
    <div className="space-y-6 text-white font-sans pb-8">
      
      {/* Mini Controls & Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Total Revenue
            </p>
            <h4 className="text-lg font-bold font-mono tracking-tight text-[#0052FF]">
              382.4 TON
            </h4>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +14.5% vs last week
          </span>
        </div>

        <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              NFT Royalties
            </p>
            <h4 className="text-lg font-bold font-mono tracking-tight text-white">
              145.2 TON
            </h4>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +8.2% vs last week
          </span>
        </div>

        <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Weekly Stream Growth
            </p>
            <h4 className="text-lg font-bold font-mono tracking-tight text-white">
              +18,400
            </h4>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +24% vs last week
          </span>
        </div>

        <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Engagement Rate
            </p>
            <h4 className="text-lg font-bold font-mono tracking-tight text-amber-500">
              88.4 / 100
            </h4>
          </div>
          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-2">
            Top 5% of all creators
          </span>
        </div>
      </div>

      {/* Main Graph & Action Button Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Streams Graph */}
        <div className="lg:col-span-8 bg-[#101A3B] border border-white/5 rounded-[12px] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Streams Performance (Weekly)
            </h3>
            <button 
              onClick={onOpenAnalytics}
              className="text-[10px] font-bold text-[#0052FF] uppercase tracking-wider hover:underline cursor-pointer"
            >
              Full Analytics
            </button>
          </div>

          <div className="h-44 w-full flex items-center justify-center pt-2">
            <svg viewBox="0 0 500 150" className="w-full h-full select-none" aria-label="Streams Performance Chart">
              {/* Horizontal Reference Grid Lines (Subtle, No Border Lines) */}
              <line x1="30" y1="34.7" x2="480" y2="34.7" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
              <line x1="30" y1="73.2" x2="480" y2="73.2" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
              <line x1="30" y1="108" x2="480" y2="108" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />

              {/* Solid Shaded Area underneath the line */}
              <path
                d="M 30,108 L 105,97 L 180,86 L 255,89.7 L 330,73.2 L 405,47.5 L 480,34.7 L 480,130 L 30,130 Z"
                fill="#0052FF"
                fillOpacity="0.08"
              />

              {/* Clean flat Area curve stroke */}
              <path
                d="M 30,108 L 105,97 L 180,86 L 255,89.7 L 330,73.2 L 405,47.5 L 480,34.7"
                fill="none"
                stroke="#0052FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Point Highlight Circles */}
              <circle cx="30" cy="108" r="4" fill="#050A24" stroke="#0052FF" strokeWidth="2" />
              <circle cx="105" cy="97" r="4" fill="#050A24" stroke="#0052FF" strokeWidth="2" />
              <circle cx="180" cy="86" r="4" fill="#050A24" stroke="#0052FF" strokeWidth="2" />
              <circle cx="255" cy="89.7" r="4" fill="#050A24" stroke="#0052FF" strokeWidth="2" />
              <circle cx="330" cy="73.2" r="4" fill="#050A24" stroke="#0052FF" strokeWidth="2" />
              <circle cx="405" cy="47.5" r="4" fill="#050A24" stroke="#0052FF" strokeWidth="2" />
              <circle cx="480" cy="34.7" r="4" fill="#050A24" stroke="#0052FF" strokeWidth="2" />

              {/* Y-Axis Value Labels */}
              <text x="10" y="38" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="end">5.2k</text>
              <text x="10" y="77" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="end">3.1k</text>
              <text x="10" y="112" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="end">1.2k</text>

              {/* X-Axis Day Labels */}
              <text x="30" y="145" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Mon</text>
              <text x="105" y="145" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Tue</text>
              <text x="180" y="145" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Wed</text>
              <text x="255" y="145" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Thu</text>
              <text x="330" y="145" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Fri</text>
              <text x="405" y="145" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Sat</text>
              <text x="480" y="145" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Sun</text>
            </svg>
          </div>
        </div>

        {/* Quick Utilities Panel */}
        <div className="lg:col-span-4 bg-[#101A3B] border border-white/5 rounded-[12px] p-4 space-y-3 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Creator Utilities
          </h3>
          
          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <button
              onClick={onUploadTrack}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-white text-[#050A24] rounded-[8px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#0052FF]" />
              <span>Upload New Track</span>
            </button>

            <button
              onClick={onMintNFT}
              className="w-full py-3 px-4 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-[8px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Gem className="w-4 h-4" />
              <span>Mint Music NFT</span>
            </button>
          </div>

          <div className="pt-2.5 border-t border-white/5 text-[10px] text-slate-400 font-mono text-center">
            Deploy smart contracts on TON Testnet
          </div>
        </div>

      </div>

      {/* Top Songs & Sales logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Songs Table */}
        <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-[#0052FF]" />
            <span>Top Performing Songs</span>
          </h3>

          <div className="space-y-2.5">
            {TOP_SONGS.map((song) => (
              <div key={song.title} className="flex items-center justify-between p-2.5 bg-white/5 rounded-[8px] hover:bg-white/10 transition-colors">
                <div className="min-w-0 pr-3">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{song.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{(song.streams).toLocaleString()} streams</p>
                </div>
                <span className="text-xs font-bold text-[#0052FF] font-mono shrink-0">
                  {song.royalties}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent NFT Sales log */}
        <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Recent NFT Sales</span>
          </h3>

          <div className="space-y-2.5">
            {RECENT_SALES.map((sale) => (
              <div key={sale.nftName} className="flex items-center justify-between p-2.5 bg-white/5 rounded-[8px] hover:bg-white/10 transition-colors">
                <div className="min-w-0 pr-3">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{sale.nftName}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sold to <span className="text-slate-300 font-semibold">{sale.buyer}</span></p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#0052FF] font-mono block">
                    {sale.price}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {sale.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
