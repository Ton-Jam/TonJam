
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_TRACKS, MOCK_NFTS, MOCK_ARTISTS } from '../constants';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';
import PlaylistCard from '../components/PlaylistCard';
import UserCard from '../components/UserCard';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const INITIAL_LIMIT = 10;
const LOAD_MORE_COUNT = 10;

const Library: React.FC = () => {
  const { 
    playAll, 
    playlists, 
    createNewPlaylist, 
    deletePlaylist,
    updatePlaylist,
    createRecommendedPlaylist,
    recentlyPlayed,
    clearRecentlyPlayed,
    likedTrackIds,
    followedUserIds,
    setActivePlaylistId,
    userNFTs,
    userTracks,
    userProfile
  } = useAudio();
  
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favTracksLimit, setFavTracksLimit] = useState(INITIAL_LIMIT);
  const [recTracksLimit, setRecTracksLimit] = useState(INITIAL_LIMIT);

  const loadMoreFavs = useCallback(() => {
    setFavTracksLimit(prev => prev + LOAD_MORE_COUNT);
  }, []);

  const loadMoreRecs = useCallback(() => {
    setRecTracksLimit(prev => prev + LOAD_MORE_COUNT);
  }, []);

  const favSentinelRef = useInfiniteScroll(loadMoreFavs);
  const recSentinelRef = useInfiniteScroll(loadMoreRecs);

  const selectedPlaylist = useMemo(() => 
    playlists.find(p => p.id === selectedPlaylistId), 
    [playlists, selectedPlaylistId]
  );

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
    return MOCK_ARTISTS.filter(a => followedUserIds.includes(a.id));
  }, [followedUserIds]);

  // Sync active playlist ID to context for options modal
  useEffect(() => {
    setActivePlaylistId(selectedPlaylistId);
    return () => setActivePlaylistId(null);
  }, [selectedPlaylistId, setActivePlaylistId]);

  if (selectedPlaylist) {
    const tracksInPlaylist = (selectedPlaylist.trackIds || [])
      .map(id => MOCK_TRACKS.find(t => t.id === id))
      .filter(Boolean) as Track[];
    
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-32 px-4 md:px-12">
        <button 
          onClick={() => {
            setSelectedPlaylistId(null);
            setActivePlaylistId(null);
          }}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-blue-400 mt-6 mb-12 transition-all group"
        >
          <i className="fas fa-chevron-left group-hover:-translate-x-1 transition-transform"></i> BACK TO VAULT
        </button>

        <div className="flex flex-col lg:flex-row gap-12 items-end mb-16">
          <div className="relative w-full lg:w-96 aspect-square group">
            <div className="absolute inset-0 translate-x-4 translate-y-4 bg-blue-500/20 border border-white/10 rounded-xl -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500"></div>
            <img src={selectedPlaylist.coverUrl} className="relative w-full h-full object-cover rounded-xl border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" alt="" />
          </div>
          
          <div className="flex-1 space-y-8">
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl">{selectedPlaylist.title}</h1>
            <p className="text-sm md:text-lg text-white/40 font-medium max-w-2xl leading-relaxed">{selectedPlaylist.description || "Synthesized sequence of high-fidelity frequencies."}</p>
            <div className="flex flex-wrap gap-5 pt-4">
              <button 
                onClick={() => playAll(tracksInPlaylist)}
                className="px-12 py-5 rounded-lg electric-blue-bg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-5 text-white shadow-2xl shadow-blue-500/40"
              >
                <i className="fas fa-play text-xs"></i> INITIALIZE SEQUENCE
              </button>
              <button 
                onClick={() => {
                  const newTitle = prompt("RENAME SEQUENCE:", selectedPlaylist.title);
                  if (newTitle && newTitle.trim()) {
                    updatePlaylist(selectedPlaylist.id, { title: newTitle.trim() });
                  }
                }}
                className="px-8 py-5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-3 text-white/60 hover:text-white hover:border-white/20"
              >
                <i className="fas fa-edit text-xs"></i> RENAME
              </button>
              <button 
                onClick={() => {
                  if (confirm("PURGE THIS SEQUENCE FROM VAULT?")) {
                    deletePlaylist(selectedPlaylist.id);
                    setSelectedPlaylistId(null);
                  }
                }}
                className="px-8 py-5 rounded-lg bg-red-500/5 border border-red-500/10 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-3 text-red-500/60 hover:text-red-500 hover:border-red-500/30"
              >
                <i className="fas fa-trash text-xs"></i> PURGE
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1 flex flex-col">
          {tracksInPlaylist.map((track) => (
            <TrackCard key={track.id} track={track} variant="row" showReorder={true} />
          ))}
          {tracksInPlaylist.length === 0 && (
            <div className="py-28 text-center glass rounded-xl border-dashed border-white/5">
              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest">Vault currently empty for this frequency.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-4 md:px-12">
      <header className="mb-6 pt-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-white leading-none mb-2">My Library</h1>
        <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em]">STORAGE PROTOCOL ACTIVE</p>
      </header>

      <div className="relative mb-10">
        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-xs"></i>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter your digital assets..." 
          className="w-full bg-[#111111] border border-white/10 py-3 pl-12 pr-10 text-xs outline-none focus:border-blue-500/50 transition-all placeholder:text-white/30 rounded-xl shadow-inner text-white"
        />
      </div>

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-12 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 electric-blue-bg rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
              <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">Recent Frequencies</h3>
            </div>
            <button 
              onClick={clearRecentlyPlayed}
              className="text-[8px] font-black text-white/30 uppercase tracking-widest hover:text-red-500/80 transition-colors"
            >
              PURGE HISTORY
            </button>
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
          <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">My Playlists</h3>
        </div>
        
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 mask-linear-fade">
          {/* Create Playlist Card */}
          <div 
            onClick={() => {
              const name = prompt("IDENTIFY NEW SYNC SEQUENCE:");
              if (name) createNewPlaylist(name);
            }}
            className="flex-shrink-0 w-36 md:w-44 aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center group cursor-pointer hover:border-blue-500/30 hover:bg-white/5 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
              <i className="fas fa-plus text-white/40 group-hover:text-blue-400 text-lg"></i>
            </div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Create Sync</span>
          </div>

          {/* AI Recommended Playlist Card */}
          <div 
            onClick={createRecommendedPlaylist}
            className="flex-shrink-0 w-36 md:w-44 aspect-square border-2 border-dashed border-blue-500/20 rounded-xl flex flex-col items-center justify-center group cursor-pointer hover:bg-blue-500/10 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 group-hover:text-blue-400 transition-colors relative z-10">
              <i className="fas fa-sparkles text-blue-400/60 group-hover:text-blue-400 text-lg"></i>
            </div>
            <span className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest group-hover:text-blue-400 transition-colors relative z-10">AI Sync</span>
            <div className="absolute top-2 right-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {playlists.map(playlist => (
            <PlaylistCard 
              key={playlist.id} 
              playlist={playlist} 
              onClick={() => setSelectedPlaylistId(playlist.id)} 
            />
          ))}
        </div>
      </section>

      {/* Followed Artists Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">Followed Nodes</h3>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
          {followedArtists.length > 0 ? (
            followedArtists.map(artist => (
              <div key={`followed-${artist.id}`} className="flex-shrink-0 w-36 md:w-44">
                <UserCard user={artist} variant="portrait" />
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center glass rounded-xl border-dashed border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">No nodes synchronized.</p>
            </div>
          )}
        </div>
      </section>

      {/* Favorite Tracks Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">Favorite Tracks</h3>
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
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full py-12 text-center glass rounded-xl border-dashed border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">No frequencies saved in vault.</p>
            </div>
          )}
        </div>
      </section>

      {/* My Uploaded Tracks Section (For Artists) */}
      {userProfile.isVerifiedArtist && userTracks.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">My Forged Protocols</h3>
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
          <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">My NFT Collection</h3>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
          {filteredNFTs.length > 0 ? (
            filteredNFTs.map(nft => (
              <div key={nft.id} className="flex-shrink-0 w-40 md:w-52">
                <NFTCard nft={nft} />
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center glass rounded-xl border-dashed border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">No assets detected.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recommended Frequencies Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <i className="fas fa-satellite-dish text-blue-500 text-[10px]"></i>
            <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em]">Recommended Frequencies</h3>
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
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Library;
