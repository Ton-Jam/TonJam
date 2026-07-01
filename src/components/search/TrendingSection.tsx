import React from 'react';
import { TrendingUp, Music, User, Library, ListMusic, Gem, LayoutGrid, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Track, Artist, Album, Playlist, NFTItem } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface TrendingSectionProps {
  trendingSong: Track | null;
  trendingArtist: Artist | null;
  trendingAlbum: Album | null;
  trendingPlaylist: Playlist | null;
  trendingNft: NFTItem | null;
  trendingCollection: { id: string; name: string; coverUrl: string; floorPrice: string } | null;
  onPlaySong: (track: Track) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingSong,
  trendingArtist,
  trendingAlbum,
  trendingPlaylist,
  trendingNft,
  trendingCollection,
  onPlaySong
}) => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'song',
      title: 'Trending Song',
      icon: Music,
      name: trendingSong?.title || 'Unknown Song',
      subtitle: trendingSong?.artist || 'Unknown Artist',
      coverUrl: trendingSong?.coverUrl || '',
      badge: 'TOP PLAYED',
      action: () => trendingSong && onPlaySong(trendingSong),
      playIcon: true
    },
    {
      id: 'artist',
      title: 'Trending Artist',
      icon: User,
      name: trendingArtist?.name || 'Unknown Artist',
      subtitle: `${(trendingArtist?.followers || 0).toLocaleString()} followers`,
      coverUrl: trendingArtist?.avatarUrl || '',
      badge: 'VIRAL ASCENT',
      action: () => trendingArtist && navigate(`/artist/${trendingArtist.uid}`)
    },
    {
      id: 'album',
      title: 'Trending Album',
      icon: Library,
      name: trendingAlbum?.title || 'Genesis Studio',
      subtitle: trendingAlbum?.artist || 'TonJam Creator',
      coverUrl: trendingAlbum?.coverUrl || '',
      badge: 'HOT RELEASE',
      action: () => trendingAlbum && navigate(`/album/${trendingAlbum.id}`)
    },
    {
      id: 'playlist',
      title: 'Trending Playlist',
      icon: ListMusic,
      name: trendingPlaylist?.title || 'Global Hits',
      subtitle: `by ${trendingPlaylist?.creator || 'Curator'}`,
      coverUrl: trendingPlaylist?.coverUrl || '',
      badge: 'CURATOR HOT',
      action: () => trendingPlaylist && navigate(`/playlist/${trendingPlaylist.id}`)
    },
    {
      id: 'nft',
      title: 'Trending NFT',
      icon: Gem,
      name: trendingNft?.title || 'Sound Wave #01',
      subtitle: `${trendingNft?.price || '0.5'} TON`,
      coverUrl: trendingNft?.imageUrl || trendingNft?.coverUrl || '',
      badge: 'TOP BID',
      action: () => trendingNft && navigate(`/nft/${trendingNft.id}`)
    },
    {
      id: 'collection',
      title: 'Trending Collection',
      icon: LayoutGrid,
      name: trendingCollection?.name || 'TonJam Genesis',
      subtitle: `Floor: ${trendingCollection?.floorPrice || '1.2'} TON`,
      coverUrl: trendingCollection?.coverUrl || '',
      badge: 'NFT CLASS',
      action: () => trendingCollection && navigate(`/marketplace`)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Wave Indicators</span>
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
        {cards.map((card) => {
          const Icon = card.icon;
          const imageSrc = card.coverUrl || getPlaceholderImage(card.name);

          return (
            <motion.div
              key={`trending-card-${card.id}`}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={card.action}
              className="w-[280px] shrink-0 bg-[#090f2d] hover:bg-[#121A3E]/20 rounded-xl border border-white/5 overflow-hidden flex flex-col justify-between aspect-[16/10] cursor-pointer group"
            >
              <div className="p-4 flex items-start gap-3 flex-1 min-w-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-slate-900">
                  <img
                    src={imageSrc}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = getPlaceholderImage(card.name); }}
                  />
                  {card.playIcon && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Play className="w-5 h-5 text-white fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[7.5px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    {card.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest pt-1">
                    <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{card.title}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors pt-1">
                    {card.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{card.subtitle}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
