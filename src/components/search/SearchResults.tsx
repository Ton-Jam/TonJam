import React from 'react';
import { motion } from 'motion/react';
import { Music, User, Disc, ListMusic, Gem, BadgeCheck, Play, Heart } from 'lucide-react';
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
    <div className="flex items-center gap-2 pb-1 mb-3">
      {icon}
      <h3 className="text-xs font-bold uppercase tracking-wider text-white">{title}</h3>
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

  // Determine Spotify-style "Top Result"
  const topResult = results.tracks[0] || results.artists[0];
  const isTopResultTrack = results.tracks.length > 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Spotify Signature "Top Result" + Top Songs side-by-side or stacked */}
      {activeFilter === 'all' && topResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top Result Card */}
          <div className="lg:col-span-5 space-y-3">
            {renderSectionHeader('Top Result', <BadgeCheck className="w-4 h-4 text-[#00B4D8]" />)}
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                if (isTopResultTrack) {
                  onPlayTrack(results.tracks[0]);
                } else {
                  navigate(`/artist/${results.artists[0].uid}`);
                }
              }}
              className="relative p-6 rounded-[14px] bg-[#0c143d] hover:bg-[#101b52] transition-colors cursor-pointer group flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="relative w-20 h-20 rounded-[10px] overflow-hidden mb-4 shadow-lg bg-slate-950">
                  <img
                    src={
                      isTopResultTrack
                        ? (results.tracks[0].coverUrl || getPlaceholderImage(results.tracks[0].title))
                        : (results.artists[0].avatarUrl || getPlaceholderImage(results.artists[0].name))
                    }
                    alt="Top Result"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-1 pr-12">
                  <h3 className="text-xl font-extrabold text-white tracking-tight line-clamp-1 group-hover:text-[#00B4D8] transition-colors">
                    {isTopResultTrack ? results.tracks[0].title : results.artists[0].name}
                  </h3>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider text-white">
                      {isTopResultTrack ? 'Song' : 'Artist'}
                    </span>
                    <p className="text-xs text-slate-400 truncate">
                      {isTopResultTrack ? results.tracks[0].artist : (results.artists[0].genre || 'Featured Artist')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Spotify Green/Cyan Play Button */}
              <div className="absolute bottom-6 right-6 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-full bg-[#00B4D8] text-black flex items-center justify-center pl-0.5">
                  <Play className="w-6 h-6 fill-current" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top 4 Songs right next to Top Result */}
          {results.tracks.length > 0 && (
            <div className="lg:col-span-7 space-y-3">
              {renderSectionHeader('Songs', <Music className="w-4 h-4 text-emerald-400" />)}
              
              <div className="space-y-1.5">
                {results.tracks.slice(0, 4).map((track, idx) => (
                  <motion.div
                    key={`top-song-${track.id}`}
                    whileHover={{ x: 3, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    onClick={() => onPlayTrack(track)}
                    className="p-2.5 rounded-[10px] bg-[#0c143d] flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-slate-500 w-4 text-center shrink-0">
                        {idx + 1}
                      </span>
                      
                      <div className="relative w-10 h-10 rounded-[6px] overflow-hidden shrink-0 bg-slate-950">
                        <img
                          src={track.coverUrl || getPlaceholderImage(track.title)}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>

                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-[#00B4D8] transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pr-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tracks Full List (when filter is 'tracks') */}
      {activeFilter === 'tracks' && results.tracks.length > 0 && (
        <div className="space-y-3">
          {renderSectionHeader('Songs', <Music className="w-4 h-4 text-emerald-400" />)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {results.tracks.map((track) => (
              <motion.div
                key={`search-track-full-${track.id}`}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                onClick={() => onPlayTrack(track)}
                className="p-3 rounded-[10px] bg-[#0c143d] flex items-center justify-between cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-[6px] overflow-hidden shrink-0 bg-slate-950">
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
                    <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-[#00B4D8] transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] font-mono text-slate-500">
                    {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Artists Match */}
      {showArtists && results.artists.length > 0 && (activeFilter === 'artists' || results.artists.length > 1) && (
        <div className="space-y-3">
          {renderSectionHeader('Artists', <User className="w-4 h-4 text-cyan-400" />)}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {results.artists.map((artist) => (
              <motion.div
                key={`search-artist-${artist.uid}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/artist/${artist.uid}`)}
                className="bg-[#0c143d] rounded-[14px] p-4 text-center flex flex-col items-center space-y-3 cursor-pointer group transition-all"
              >
                <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-md bg-slate-950">
                  <img
                    src={artist.avatarUrl || getPlaceholderImage(artist.name)}
                    alt={artist.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="w-full truncate space-y-0.5">
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00B4D8] transition-colors truncate">
                    {artist.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {artist.genre || 'Artist'}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(artist.uid);
                  }}
                  className="w-full text-[9px] font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 rounded-full h-7"
                >
                  {followedUserIds.includes(artist.uid) ? 'Following' : 'Follow'}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Albums Match */}
      {showAlbums && results.albums.length > 0 && (
        <div className="space-y-3">
          {renderSectionHeader('Albums', <Disc className="w-4 h-4 text-pink-400" />)}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {results.albums.map((album) => (
              <motion.div
                key={`search-album-${album.id}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/album/${album.id}`)}
                className="bg-[#0c143d] rounded-[14px] p-3.5 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-[10px] overflow-hidden bg-slate-950">
                  <img
                    src={album.coverUrl || getPlaceholderImage(album.title)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-2.5 group-hover:text-[#00B4D8] transition-colors">
                  {album.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">{album.artist}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists Match */}
      {showPlaylists && results.playlists.length > 0 && (
        <div className="space-y-3">
          {renderSectionHeader('Playlists', <ListMusic className="w-4 h-4 text-amber-400" />)}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {results.playlists.map((playlist) => (
              <motion.div
                key={`search-playlist-${playlist.id}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="bg-[#0c143d] rounded-[14px] p-3.5 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-[10px] overflow-hidden bg-slate-950">
                  <img
                    src={playlist.coverUrl || getPlaceholderImage(playlist.title)}
                    alt={playlist.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-2.5 group-hover:text-[#00B4D8] transition-colors">
                  {playlist.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">by {playlist.creator}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* NFTs Grid */}
      {showNFTs && results.nfts.length > 0 && (
        <div className="space-y-3">
          {renderSectionHeader('Music Collectibles & NFTs', <Gem className="w-4 h-4 text-purple-400" />)}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {results.nfts.map((nft) => (
              <motion.div
                key={`search-nft-${nft.id}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/nft/${nft.id}`)}
                className="bg-[#0c143d] rounded-[14px] p-3.5 flex flex-col justify-between cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-[10px] overflow-hidden bg-slate-950">
                  <img
                    src={nft.imageUrl || nft.coverUrl || getPlaceholderImage(nft.title)}
                    alt={nft.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-2.5 truncate">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                    {nft.title}
                  </h4>
                  <p className="text-[10px] font-mono text-[#00B4D8] font-bold mt-0.5">{nft.price} TON</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
