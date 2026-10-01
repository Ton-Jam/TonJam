import React from 'react';
import { NFTItem } from '@/types';
import ArtistNFTScrollCard from '@/components/artist/ArtistNFTScrollCard';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { Sparkles, Disc } from 'lucide-react';

interface ArtistNFTsSectionProps {
  artistNFTs: NFTItem[];
  isOwnProfile: boolean;
  onNFTAction: (nft: NFTItem) => void;
}

const ArtistNFTsSection: React.FC<ArtistNFTsSectionProps> = ({
  artistNFTs,
  isOwnProfile,
  onNFTAction,
}) => {
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  return (
    <div className="space-y-4 w-full text-left">
      <div className="flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
            Music NFT Collection
          </h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          {artistNFTs.length} Assets
        </span>
      </div>

      <div
        ref={scrollRef}
        {...handlers}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4 sm:px-6 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory' }}
      >
        {artistNFTs.map(n => (
          <div key={n.id} style={{ scrollSnapAlign: 'start' }} className="shrink-0">
            <ArtistNFTScrollCard 
              nft={n} 
              onAction={isOwnProfile ? onNFTAction : undefined}
            />
          </div>
        ))}

        {artistNFTs.length === 0 && (
          <div className="w-full py-12 text-center bg-white/[0.02] rounded-3xl mx-4">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No Music NFTs minted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistNFTsSection;
