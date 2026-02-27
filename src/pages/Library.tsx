import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Sparkles, Antenna } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_NFTS, MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import PlaylistCard from '@/components/PlaylistCard';
import UserCard from '@/components/UserCard';

const INITIAL_LIMIT = 10;

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { playAll, playlists, createNewPlaylist, deletePlaylist, updatePlaylist, createRecommendedPlaylist, recentlyPlayed, clearRecentlyPlayed, likedTrackIds, followedUserIds, setActivePlaylistId, userNFTs, userTracks, userProfile, artists } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [favTracksLimit, setFavTracksLimit] = useState(INITIAL_LIMIT);
  const [recTracksLimit, setRecTracksLimit] = useState(INITIAL_LIMIT);
  const favSentinelRef = useRef<HTMLDivElement>(null);
  const recSentinelRef = useRef<HTMLDivElement>(null);

  const filteredNFTs = useMemo(() => {
    const allNFTs = [...userNFTs, ...MOCK_NFTS];
    return allNFTs.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.creator.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, userNFTs]);

  const likedTracks = useMemo(() => {
    const allTracks = [...userTracks, ...MOCK_TRACKS];
    return allTracks.filter(t => likedTrackIds.includes(t.id));
  }, [likedTrackIds, userTracks]);

  const filteredLikedTracks = useMemo(() => {
    return likedTracks.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [likedTracks, searchQuery]);

  const followedArtists = useMemo(() => {
    return artists.filter(a => followedUserIds.includes(a.id));
  }, [followedUserIds, artists]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setFavTracksLimit(prev => prev + 10);
      }
    });
    if (favSentinelRef.current) observer.observe(favSentinelRef.current);
    return () => observer.disconnect();
  }, [filteredLikedTracks]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setRecTracksLimit(prev => prev + 10);
      }
    });
    if (recSentinelRef.current) observer.observe(recSentinelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-4 md:px-12">
      <header className="mb-6 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase text-white leading-none mb-2">My Library</h1>
        <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.5em]">STORAGE PROTOCOL ACTIVE</p>
      </header>

      <div className="relative mb-10">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter your digital assets..." className="w-full bg-[#111111] py-3 pl-12 pr-10 text-xs outline-none transition-all placeholder:text-white/30 rounded-[10px] shadow-inner text-white" />
      </div>

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-12 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 electric-blue-bg rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
              <h3 className="text-[9px] font-bold text-white/60 uppercase tracking-[0.5em]">Recent Frequencies</h3>
            </div>
            <button onClick={clearRecentlyPlayed} className="text-[8px] font-bold text-white/30 uppercase tracking-widest hover:text-red-500/80 transition-colors" > PURGE HISTORY </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mask-linear-fade">
            {recentlyPlayed.map(track => (
              <div key={`recent-${track.id}`} className="flex-shrink-0 w-36 md:w-44">
                <TrackCard track={track} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Playlists Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[9px] font-bold text-white/60 uppercase tracking-[0.5em]">My Playlists</h3>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 mask-linear-fade">
          {/* Create Playlist Card */}
          <div onClick={() => { const name = prompt("IDENTIFY NEW SYNC SEQUENCE:"); if (name) createNewPlaylist(name); }} className="flex-shrink-0 w-36 md:w-44 aspect-square rounded-[10px] flex flex-col items-center justify-center group cursor-pointer hover:bg-white/5 transition-all" >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
              <Plus className="text-white/40 group-hover:text-blue-400 h-6 w-6" />
            </div>
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Create Sync</span>
          </div>

          {/* AI Recommended Playlist Card */}
          <div onClick={createRecommendedPlaylist} className="flex-shrink-0 w-36 md:w-44 aspect-square rounded-[10px] flex flex-col items-center justify-center group cursor-pointer hover:bg-blue-500/10 transition-all relative overflow-hidden" >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 group-hover:text-blue-400 transition-colors relative z-10">
              <Sparkles className="text-blue-400/60 group-hover:text-blue-400 h-6 w-6" />
            </div>
            <span className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest group-hover:text-blue-400 transition-colors relative z-10">AI Sync</span>
            <div className="absolute top-2 right-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {playlists.map(playlist => (
            <div key={playlist.id} className="flex-shrink-0 w-36 md:w-44">
              <PlaylistCard playlist={playlist} onClick={() => navigate(`/playlist/${playlist.id}`)} />
            </div>
          ))}
        </div>
      </section>

      {/* Followed Artists Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[9px] font-bold text-white/60 uppercase tracking-[0.5em]">Followed Nodes</h3>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
          {followedArtists.length > 0 ? (
            followedArtists.map(artist => (
              <div key={`followed-${artist.id}`} className="flex-shrink-0 w-36 md:w-44">
                <UserCard user={artist} variant="portrait" />
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center glass border border-blue-500/10 rounded-[10px]">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">No nodes synchronized.</p>
            </div>
          )}
        </div>
      </section>

      {/* Favorite Tracks Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[9px] font-bold text-white/60 uppercase tracking-[0.5em]">Favorite Tracks</h3>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
          {filteredLikedTracks.length > 0 ? (
            <>
              {filteredLikedTracks.slice(0, favTracksLimit).map(track => (
                <div key={track.id} className="flex-shrink-0 w-40 md:w-52">
                  <TrackCard track={track} />
                </div>
              ))}
              {favTracksLimit < filteredLikedTracks.length && (
                <div ref={favSentinelRef} className="flex-shrink-0 w-10 flex items-center justify-center">
                  <div className="w-6 h-6 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full py-12 text-center glass border border-blue-500/10 rounded-[10px]">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">No frequencies saved in vault.</p>
            </div>
          )}
        </div>
      </section>

      {/* My Uploaded Tracks Section */}
      {userProfile.isVerifiedArtist && userTracks.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[9px] font-bold text-white/60 uppercase tracking-[0.5em]">My Forged Protocols</h3>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
            {userTracks.map(track => (
              <div key={`upload-${track.id}`} className="flex-shrink-0 w-40 md:w-52">
                <TrackCard track={track} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My NFT Collection Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[9px] font-bold text-white/60 uppercase tracking-[0.5em]">My NFT Collection</h3>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
          {filteredNFTs.length > 0 ? (
            filteredNFTs.map(nft => (
              <div key={nft.id} className="flex-shrink-0 w-40 md:w-52">
                <NFTCard nft={nft} />
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center glass border border-blue-500/10 rounded-[10px]">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">No assets detected.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recommended Frequencies Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Antenna className="text-blue-500 h-4 w-4" />
            <h3 className="text-[9px] font-bold text-white/60 uppercase tracking-[0.5em]">Recommended Frequencies</h3>
          </div>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
          {MOCK_TRACKS.slice(0, recTracksLimit).map(track => (
            <div key={`rec-${track.id}`} className="flex-shrink-0 w-40 md:w-52">
              <TrackCard track={track} />
            </div>
          ))}
          {recTracksLimit < MOCK_TRACKS.length && (
            <div ref={recSentinelRef} className="flex-shrink-0 w-10 flex items-center justify-center">
              <div className="w-6 h-6 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Library;
