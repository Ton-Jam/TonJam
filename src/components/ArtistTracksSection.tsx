import React, { useState } from 'react';
import { Play, Satellite, Tag, Gavel, Info } from 'lucide-react';
import { Track, NFTItem, ArtistEvent, Collaboration, Artist } from '@/types';
import TrackCard from '@/components/TrackCard';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { TON_LOGO } from '@/constants';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface ArtistTracksSectionProps {
  artistTracks: Track[];
  isOwnProfile: boolean;
  playAll: (tracks: Track[]) => void;
  featuredNFT?: NFTItem;
  topTracks: Track[];
  trackFilter: string;
  setTrackFilter: (filter: string) => void;
  artist: Artist;
}

const ArtistTracksSection: React.FC<ArtistTracksSectionProps> = ({
  artistTracks,
  isOwnProfile,
  playAll,
  featuredNFT,
  topTracks,
  trackFilter,
  setTrackFilter,
  artist,
}) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(10);
  
  const sentinelRef = useInfiniteScroll(() => {
    setVisibleCount(prev => prev + 10);
  });

  const filteredTracks = artistTracks.filter(t => {
    if (trackFilter === 'All') return true;
    if (trackFilter === 'NFTs') return t.isNFT;
    if (trackFilter === 'Releases') return !t.isCollaboration;
    if (trackFilter === 'Collaborations') return t.isCollaboration;
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Featured NFT Highlight */}
      {featuredNFT && (
        <div className="mb-4 relative group cursor-pointer" onClick={() => navigate(`/nft/${featuredNFT.id}`)}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative glass border border-amber-500/30 bg-foreground/[0.01] p-5 rounded-[16px] flex flex-col md:flex-row items-center gap-4 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Satellite className="h-32 w-32 text-amber-500" />
            </div>
            <div className="relative w-full md:w-32 aspect-square rounded-[12px] overflow-hidden shadow-2xl">
              <img src={featuredNFT.imageUrl || getPlaceholderImage(`nft-${featuredNFT.id}`)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <span className="px-2 py-2 bg-amber-500 text-background rounded-[4px] text-[8px] font-bold uppercase tracking-widest">Featured Artifact</span>
                {featuredNFT.listingType === 'auction' && (
                  <span className="flex items-center gap-2 text-[8px] font-bold text-amber-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Live Auction
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-foreground uppercase tracking-tighter mb-1">{featuredNFT.title}</h3>
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">Minted Protocol • {featuredNFT.edition} Edition</p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-4">
                  <img src={TON_LOGO} className="w-4 h-4" alt="" />
                  <span className="text-xl font-bold text-foreground tracking-tighter">{featuredNFT.price} TON</span>
                </div>
                <button className="px-4 py-4 bg-amber-500 hover:bg-amber-400 text-background rounded-[8px] text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/20">
                  {featuredNFT.listingType === 'auction' ? 'Place Bid' : 'Acquire Protocol'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Tracks Section */}
      {topTracks.length > 0 && (
        <section className="bg-card rounded-[10px] p-5">
          <h3 className="text-lg font-bold text-foreground mb-4">Popular</h3>
          <div className="space-y-2">
            {topTracks.slice(0, 3).map((track, idx) => (
              <TrackCard 
                key={`top-${track.id}`}
                track={track}
                variant="row"
                index={idx}
                className="hover:bg-muted/50"
              />
            ))}
          </div>
        </section>
      )}

      {/* All Tracks Grid */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">All Tracks</h3>
          <div className="flex items-center gap-2">
            {['All', 'NFTs', 'Releases', 'Collaborations'].map((filter) => (
              <button
                key={filter}
                onClick={() => setTrackFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${
                  trackFilter === filter 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {filteredTracks.slice(0, visibleCount).map((t, i) => (
            <TrackCard 
              key={t.id}
              track={t} 
              variant="row"
              index={i}
              onMint={isOwnProfile ? (track) => navigate('/mint', { state: { track } }) : undefined}
            />
          ))}
          <div ref={sentinelRef} className="h-4" />
        </div>
        {filteredTracks.length === 0 && (
          <div className="py-4 text-center bg-card rounded-[10px]">
            <p className="text-xs text-muted-foreground">No tracks broadcasted.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ArtistTracksSection;
