import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAudio } from '@/contexts/AudioContext';
import { MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import { NFTItem } from '@/types';
import { ShoppingCart, Layers } from 'lucide-react';
import VerifiedArtistBadge from '@/components/common/VerifiedArtistBadge';
import { MarqueeTitle } from './MarqueeTitle';
import { cardTokens } from '@/design';

interface TrendingNFTCardProps {
  nft: NFTItem;
  onClick?: () => void;
}

const TrendingNFTCard: React.FC<TrendingNFTCardProps> = ({ nft, onClick }) => {
  const navigate = useNavigate();
  const { allTracks, playTrack, collections } = useAudio();

  const artist = MOCK_ARTISTS.find(a => a.name.toLowerCase() === (nft.creator || nft.artist || '').toLowerCase());
  const isVerified = nft.artistVerified || artist?.verified || artist?.isVerifiedArtist;

  const nftCollection = collections?.find(c => c.nftIds?.includes(nft.id));
  const traitCollection = nft.traits?.find(t => t.trait_type.toLowerCase() === 'collection' || t.trait_type.toLowerCase() === 'series')?.value as string ||
                          nft.attributes?.find(t => t.trait_type.toLowerCase() === 'collection' || t.trait_type.toLowerCase() === 'series')?.value as string;
  const collectionName = nftCollection?.name || traitCollection || (nft.title.includes(':') ? nft.title.split(':')[0] : null);

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }

    const track = allTracks.find(t => t.id === nft.trackId) || MOCK_TRACKS.find(t => t.id === nft.trackId);
    if (track) {
      playTrack(track);
    } else {
      const fallbackTrack = {
        id: nft.trackId || nft.id,
        title: nft.title,
        artist: nft.artist || nft.creator,
        coverUrl: nft.imageUrl,
        audioUrl: nft.audioUrl || (MOCK_TRACKS[0]?.audioUrl ?? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
      };
      playTrack(fallbackTrack as any);
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/nft/${nft.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      style={{
        width: 'var(--card-width, 168px)',
        borderRadius: 'var(--card-radius, 12px)',
        padding: 'var(--card-padding, 10px)',
      }}
      className="group relative cursor-pointer p-[10px] rounded-[12px] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-200 flex flex-col w-[168px] shrink-0 select-none"
    >
      {/* Artwork */}
      <div 
        className="relative aspect-square w-full rounded-[10px] overflow-hidden bg-neutral-900/60"
        style={{ borderRadius: 'var(--card-image-radius, 10px)' }}
      >
        <img 
          src={nft.imageUrl || 'https://via.placeholder.com/150'} 
          alt={nft.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Floating Quick Buy / View Action */}
        <div className="absolute bottom-2 right-2 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <button 
            onClick={handleBuyClick}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all"
            aria-label="Buy NFT"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div 
        className="flex flex-col w-full min-w-0 mt-[6px]"
        style={{ marginTop: 'var(--card-content-gap, 6px)' }}
      >
        <h4 
          className="text-[14px] leading-[20px] font-semibold tracking-tight text-white/95 truncate w-full group-hover:text-blue-400 transition-colors"
          style={{
            fontSize: 'var(--card-title-size, 14px)',
            lineHeight: 'var(--card-title-line-height, 20px)',
          }}
        >
          {nft.title}
        </h4>
        <p 
          className="text-[12px] leading-[17px] font-normal text-zinc-400 truncate w-full mt-0.5 hover:text-white transition-colors flex items-center gap-1"
          style={{
            fontSize: 'var(--card-meta-size, 12px)',
            lineHeight: 'var(--card-meta-line-height, 17px)',
          }}
        >
          <span className="truncate">{nft.creator || nft.artist}</span>
          <VerifiedArtistBadge artistName={nft.creator || nft.artist} isVerified={isVerified} size="xs" />
        </p>
        <div 
          className="flex items-center gap-1 mt-1 text-[12px] leading-[17px] font-medium text-white/80 font-mono"
          style={{
            fontSize: 'var(--card-meta-size, 12px)',
            lineHeight: 'var(--card-meta-line-height, 17px)',
          }}
        >
          <span className="text-blue-400 font-bold">{nft.price}</span>
          <span className="text-white/40">TON</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrendingNFTCard;
