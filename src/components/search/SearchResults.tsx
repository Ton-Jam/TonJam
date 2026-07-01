import React from 'react';
import { motion } from 'motion/react';
import { Music, User, Disc, ListMusic, Gem, LayoutGrid, Radio, BadgeCheck, Play, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Track, Artist, Album, Playlist, NFTItem, UserProfile } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from './EmptyState';

interface SearchResultsProps {
  query: string;
  activeFilter: string;
  results: {
    tracks: Track[];
    artists: Artist[];
    albums: Album[];
    playlists: Playlist[];
    nfts: NFTItem[];
    users: UserProfile[];
  };
  onPlayTrack: (track: Track) => void;
  followedUserIds: string[];
  onToggleFollow: (id: string) => void;
  onClearQuery?: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  activeFilter,
  results,
  onPlayTrack,
  followedUserIds,
  onToggleFollow,
  onClearQuery
}) => {
  const navigate = useNavigate();

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-4">
      {icon}
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{title}</h3>
    </div>
  );

  const hasAnyResults = 
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0 ||
    results.nfts.length > 0 ||
    results.users.length > 0;

  if (!hasAnyResults) {
    return (
      <EmptyState
        variant="no-results"
        query={query}
        onClearQuery={onClearQuery}
        onNavigateNFTs={() => navigate('/marketplace')}
        onNavigateArtists={onClearQuery}
      />
    );
  }

  // Segment matches based on filter
  const showTracks = activeFilter === 'all' || activeFilter === 'tracks';
  const showArtists = activeFilter === 'all' || activeFilter === 'artists';
  const showAlbums = activeFilter === 'all' || activeFilter === 'albums';
  const showPlaylists = activeFilter === 'all' || activeFilter === 'playlists';
  const showNFTs = activeFilter === 'all' || activeFilter === 'nfts';
  const showUsers = activeFilter === 'all' || activeFilter === 'users';

  return (
    <div className="space-y-10 pb-20">
      {/* Top Match Result (if "all" is selected) */}
      {activeFilter === 'all' && results.artists.length > 0 && (
        <div className="space-y-4">
          {renderSectionHeader('Top Match', <BadgeCheck className="w-4 h-4 text-[#0052FF]" />)}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => navigate(`/artist/${results.artists[0].uid}`)}
            className="p-5 rounded-xl bg-gradient-to-br from-[#0c133a]/50 to-[#070a24]/60 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                <img
                  src={results.artists[0].avatarUrl || getPlaceholderImage(results.artists[0].name)}
                  alt={results.artists[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                    {results.artists[0].name}
                  </h4>
                  {results.artists[0].verified && (
                    <BadgeCheck className="w-5 h-5 text-[#0052FF] fill-current" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                  {results.artists[0].genre || 'Artist Spotlight'}
                </p>
                <p className="text-[9px] text-slate-500 font-mono">
                  {(results.artists[0].followers || 0).toLocaleString()} followers
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFollow(results.artists[0].uid);
              }}
              className="text-[9px] font-bold uppercase tracking-widest bg-[#0052FF] text-white hover:bg-[#0052FF]/85 rounded-lg h-8"
            >
              {followedUserIds.includes(results.artists[0].uid) ? 'FOLLOWING' : '+ FOLLOW'}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Tracks List */}
      {showTracks && results.tracks.length > 0 && (
        <div className="space-y-4">
          {renderSectionHeader('Tracks Match', <Music className="w-4 h-4 text-emerald-400" />)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.tracks.map((track) => (
              <motion.div
                key={`search-track-${track.id}`}
                whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => onPlayTrack(track)}
                className="p-3 rounded-xl bg-[#090f2d] border border-white/5 flex items-center justify-between cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-slate-900">
                    <img
                      src={track.coverUrl || getPlaceholderImage(track.title)}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[9px] font-mono text-slate-500">
                    {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* NFTs Grid */}
      {showNFTs && results.nfts.length > 0 && (
        <div className="space-y-4">
          {renderSectionHeader('NFT Artifacts', <Gem className="w-4 h-4 text-purple-400" />)}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {results.nfts.map((nft) => (
              <motion.div
                key={`search-nft-${nft.id}`}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/nft/${nft.id}`)}
                className="bg-[#090f2d] hover:bg-[#121A3E]/20 rounded-xl border border-white/5 p-4 flex flex-col justify-between aspect-[4/5] cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-950 border border-white/5">
                  <img
                    src={nft.imageUrl || nft.coverUrl || getPlaceholderImage(nft.title)}
                    alt={nft.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 truncate">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors">
                    {nft.title}
                  </h4>
                  <p className="text-[9px] font-mono text-[#0052FF] font-bold">{nft.price} TON</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Artists Match */}
      {showArtists && results.artists.length > 0 && activeFilter !== 'all' && (
        <div className="space-y-4">
          {renderSectionHeader('Artists Match', <User className="w-4 h-4 text-cyan-400" />)}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {results.artists.map((artist) => (
              <motion.div
                key={`search-artist-${artist.uid}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/artist/${artist.uid}`)}
                className="bg-[#090f2d] hover:bg-[#121A3E]/20 rounded-xl border border-white/5 p-4 text-center flex flex-col items-center space-y-3 cursor-pointer group transition-all"
              >
                <div className="relative h-16 w-16 rounded-full overflow-hidden border border-white/5">
                  <img
                    src={artist.avatarUrl || getPlaceholderImage(artist.name)}
                    alt={artist.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-cyan-400 transition-colors truncate w-full">
                  {artist.name}
                </h4>
                <p className="text-[9px] text-[#0052FF] font-mono font-bold tracking-widest uppercase">
                  {artist.genre || 'Creator'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Albums Match */}
      {showAlbums && results.albums.length > 0 && (
        <div className="space-y-4">
          {renderSectionHeader('Albums Match', <Disc className="w-4 h-4 text-pink-400" />)}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {results.albums.map((album) => (
              <motion.div
                key={`search-album-${album.id}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/album/${album.id}`)}
                className="bg-[#090f2d] hover:bg-[#121A3E]/20 rounded-xl border border-white/5 p-4 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-white/5">
                  <img
                    src={album.coverUrl || getPlaceholderImage(album.title)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate mt-3 group-hover:text-[#0052FF] transition-colors">
                  {album.title}
                </h4>
                <p className="text-[9px] text-slate-400 truncate">{album.artist}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists Match */}
      {showPlaylists && results.playlists.length > 0 && (
        <div className="space-y-4">
          {renderSectionHeader('Playlists Match', <ListMusic className="w-4 h-4 text-amber-500" />)}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {results.playlists.map((playlist) => (
              <motion.div
                key={`search-playlist-${playlist.id}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="bg-[#090f2d] hover:bg-[#121A3E]/20 rounded-xl border border-white/5 p-4 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-white/5">
                  <img
                    src={playlist.coverUrl || getPlaceholderImage(playlist.title)}
                    alt={playlist.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate mt-3 group-hover:text-[#0052FF] transition-colors">
                  {playlist.title}
                </h4>
                <p className="text-[9px] text-slate-400 truncate">by {playlist.creator}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* User Profiles Match */}
      {showUsers && results.users.length > 0 && (
        <div className="space-y-4">
          {renderSectionHeader('User Synapses', <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.users.map((usr) => (
              <motion.div
                key={`search-user-${usr.uid}`}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/user/${usr.uid}`)}
                className="p-4 rounded-xl bg-[#090f2d] hover:bg-[#121A3E]/15 border border-white/5 flex items-center justify-between cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/5 bg-slate-900">
                    <img
                      src={usr.avatar || getPlaceholderImage(usr.name)}
                      alt={usr.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                      {usr.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-mono">@{usr.username || 'user'}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(usr.uid);
                  }}
                  className="text-[8px] font-bold uppercase tracking-widest bg-transparent border border-white/10 text-white hover:bg-white/5 rounded-lg h-7"
                >
                  {followedUserIds.includes(usr.uid) ? 'FOLLOWING' : '+ FOLLOW'}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
