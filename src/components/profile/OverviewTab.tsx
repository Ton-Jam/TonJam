import React from 'react';
import { Play, Disc, Award, BarChart3, Star, Heart, Flame, ShieldAlert, ArrowRight, Compass } from 'lucide-react';
import { ProfileData, Achievement, MOCK_ACHIEVEMENTS, MOCK_LISTENING_STATS } from './ProfileTypes';
import { Section } from '@/components/layout/Section';
import { HorizontalCarousel } from '@/components/layout/HorizontalCarousel';

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
  progress?: number; // for continue listening
}

interface ArtistItem {
  uid: string;
  name: string;
  avatar: string;
  followers: string;
}

interface OverviewTabProps {
  profile: ProfileData;
  onPlayTrack: (trackId: string) => void;
  onSelectArtist: (artistId: string) => void;
}

const RECENTLY_PLAYED_TRACKS: TrackItem[] = [
  { id: 't_1', title: 'Supersonic', artist: 'Cyber Beats', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=200&h=200&q=80', duration: '3:45' },
  { id: 't_2', title: 'Starlight Waves', artist: 'Astral Echo', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=200&h=200&q=80', duration: '4:12' },
  { id: 't_3', title: 'Solitude', artist: 'Hologram Kid', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&h=200&q=80', duration: '2:58' },
];

const CONTINUE_LISTENING_TRACKS: TrackItem[] = [
  { id: 't_4', title: 'Quantum Flux', artist: 'Vortex', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&h=200&q=80', duration: '5:20', progress: 65 },
  { id: 't_5', title: 'Neon Highway', artist: 'Grid Runner', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=200&h=200&q=80', duration: '3:50', progress: 20 },
];

const FAVORITE_ARTISTS: ArtistItem[] = [
  { uid: 'art_1', name: 'Cyber Beats', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', followers: '154k' },
  { uid: 'art_2', name: 'Astral Echo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', followers: '89k' },
  { uid: 'art_3', name: 'Grid Runner', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80', followers: '210k' },
];

const TRENDING_ARTISTS: ArtistItem[] = [
  { uid: 'art_4', name: 'Wave Shaper', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80', followers: '45k' },
  { uid: 'art_5', name: 'Hologram Kid', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80', followers: '12k' },
];

export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  onPlayTrack,
  onSelectArtist
}) => {
  return (
    <div className="space-y-4 text-white font-sans pb-8">
      
      {/* 2-Column Responsive Overview Core */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Play history & continues */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Continue Listening Section */}
          <Section 
            title="Continue Listening" 
            subtitle="Pick up where you left off"
            lazy={true}
            className="!px-0 !my-0"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {CONTINUE_LISTENING_TRACKS.map((track) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track.id)}
                  className="bg-[#101A3B] p-3 rounded-[12px] flex items-center gap-3 hover:bg-[#15234f] transition-all cursor-pointer group select-none"
                >
                  <div className="relative w-12 h-12 rounded-[8px] overflow-hidden bg-slate-900 shrink-0">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-white transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                    
                    {/* Compact progress timeline */}
                    <div className="w-full bg-white/10 h-1 rounded-full mt-2.5 overflow-hidden">
                      <div 
                        className="bg-[#0052FF] h-full rounded-full" 
                        style={{ width: `${track.progress || 0}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Recently Played Section */}
          <Section 
            title="Recently Played" 
            subtitle="Your recent sonic history"
            lazy={true}
            className="!px-0 !my-0"
          >
            <div className="space-y-1 mt-1">
              {RECENTLY_PLAYED_TRACKS.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track.id)}
                  className="bg-[#101A3B] p-3 rounded-[12px] flex items-center justify-between hover:bg-[#15234f] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono text-slate-500 font-bold shrink-0 w-4">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-slate-900 shrink-0">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{track.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Pinned Playlist */}
          <div className="bg-[#101A3B] rounded-[12px] p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:bg-[#15234f] transition-all">
            <div>
              <div className="inline-block px-2.5 py-0.5 bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-bold uppercase tracking-widest rounded-md mb-2">
                Pinned Playlist
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-tight font-sans">
                Late Night Drive Frequencies
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                A curated selection of deep techno, ambient pads, and cyber-industrial rhythms.
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs font-mono text-slate-400">18 tracks • 1h 24m</span>
              <button 
                onClick={() => onPlayTrack('pinned')}
                className="p-2.5 bg-slate-100 text-[#050A24] rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-[#050A24]" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Achievements & Stats */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Favorite NFT Collection Banner */}
          <Section 
            title="Featured NFT" 
            subtitle="Active Web3 asset"
            lazy={true}
            className="!px-0 !my-0 bg-[#101A3B] rounded-[12px] p-4 flex flex-col justify-between"
          >
            <div className="w-full h-24 rounded-[8px] overflow-hidden bg-slate-900 relative mt-1">
              <img 
                src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80" 
                alt="Sonic Resonance" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Supersonic Club V1</h4>
                <p className="text-[10px] text-slate-300">Floor: 12.5 TON</p>
              </div>
            </div>
            <button className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 active:bg-white/20 text-xs font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer text-slate-300 hover:text-white">
              View Collection
            </button>
          </Section>

          {/* Listening Profile Stats */}
          <div className="bg-[#101A3B] rounded-[12px] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#0052FF]" />
              <span>Genre Breakdown</span>
            </h3>
            
            <div className="space-y-3.5">
              {MOCK_LISTENING_STATS.map((stat) => (
                <div key={stat.genre} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-200">{stat.genre}</span>
                    <span className="font-mono text-slate-400">{stat.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0052FF] h-full rounded-full" 
                      style={{ width: `${stat.percentage}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Block */}
          <div className="bg-[#101A3B] rounded-[12px] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Recent Achievements</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {MOCK_ACHIEVEMENTS.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-[8px] hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-[#0052FF]/10 text-[#0052FF] rounded-[8px] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{badge.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Reusable Horizontal Carousel for Favorite Artists */}
      <Section 
        title="Favorite Artists" 
        subtitle="Ecosystem creators you love"
        onSeeAll={() => alert('View all artists')}
        className="!px-0 pt-4"
      >
        <HorizontalCarousel className="mt-2">
          {[...FAVORITE_ARTISTS, ...TRENDING_ARTISTS].map((artist) => (
            <div
              key={artist.uid}
              onClick={() => onSelectArtist(artist.uid)}
              className="bg-[#101A3B] border border-white/5 rounded-[12px] p-3 text-center cursor-pointer hover:bg-[#15234f] transition-all group w-[124px] select-none"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden mx-auto bg-slate-900 border border-white/10 mb-2">
                <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white">{artist.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{artist.followers} followers</p>
            </div>
          ))}
        </HorizontalCarousel>
      </Section>

    </div>
  );
};
