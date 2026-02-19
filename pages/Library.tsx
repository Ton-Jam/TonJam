
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_TRACKS, MOCK_NFTS } from '../constants';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';
import PlaylistCard from '../components/PlaylistCard';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types';

const Library: React.FC = () => {
  // Fix: Initialized navigate hook from react-router-dom to handle navigation
  const navigate = useNavigate();
  const { 
    playAll, 
    playlists, 
    createNewPlaylist, 
    deletePlaylist,
    updatePlaylist,
    recentlyPlayed,
    clearRecentlyPlayed,
    likedTrackIds,
    setActivePlaylistId
  } = useAudio();
  
  const [activeTab, setActiveTab] = useState<'tracks' | 'nfts' | 'liked'>('tracks');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedPlaylist = useMemo(() => 
    playlists.find(p => p.id === selectedPlaylistId), 
    [playlists, selectedPlaylistId]
  );

  const filteredTracks = useMemo(() => {
    return MOCK_TRACKS.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredNFTs = useMemo(() => {
    return MOCK_NFTS.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.creator.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const likedTracks = useMemo(() => {
    return MOCK_TRACKS.filter(t => likedTrackIds.includes(t.id));
  }, [likedTrackIds]);

  const filteredLikedTracks = useMemo(() => {
    return likedTracks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [likedTracks, searchQuery]);

  // Sync active playlist ID to context for options modal
  React.useEffect(() => {
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
            <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-2xl">{selectedPlaylist.title}</h1>
            <p className="text-sm md:text-lg text-white/40 font-medium italic max-w-2xl leading-relaxed">{selectedPlaylist.description || "Synthesized sequence of high-fidelity frequencies."}</p>
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
              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest italic">Vault currently empty for this frequency.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-4 md:px-12">
      <div className="relative mb-12 pt-8">
        <i className="fas fa-search absolute left-7 top-1/2 -translate-y-1/2 text-white/20 text-sm"></i>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter your digital assets..." 
          className="w-full bg-[#111111] border border-white/5 py-5 pl-16 pr-10 text-sm outline-none focus:border-blue-500/30 transition-all placeholder:text-white/10 rounded-xl shadow-inner text-white italic"
        />
      </div>

      <header className="mb-14">
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-none mb-4">DIGITAL VAULT</h1>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic">STORAGE PROTOCOL ACTIVE</p>
      </header>

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-20 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 electric-blue-bg rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
              <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic">Recent Frequencies</h3>
            </div>
            <button 
              onClick={clearRecentlyPlayed}
              className="text-[9px] font-black text-white/10 uppercase tracking-widest hover:text-red-500/60 transition-colors"
            >
              PURGE HISTORY
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6">
            {recentlyPlayed.map(track => (
              <div key={`recent-${track.id}`} className="flex-shrink-0 w-40 md:w-48">
                <TrackCard track={track} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-20">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic">Sequences</h3>
          <button 
            onClick={() => {
              const name = prompt("IDENTIFY NEW SYNC SEQUENCE:");
              if (name) createNewPlaylist(name);
            }}
            className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2.5 hover:text-white transition-colors"
          >
            <i className="fas fa-plus"></i> NEW SYNC
          </button>
        </div>
        
        <div className="flex gap-12 overflow-x-auto no-scrollbar pb-10">
          {playlists.map(playlist => (
            <PlaylistCard 
              key={playlist.id} 
              playlist={playlist} 
              onClick={() => setSelectedPlaylistId(playlist.id)} 
            />
          ))}
        </div>
      </section>

      <div className="flex items-center gap-5 mb-12 border-t border-white/5 pt-12">
        <button 
          onClick={() => setActiveTab('tracks')}
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tracks' ? 'electric-blue-bg text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 text-white/30 hover:text-white'}`}
        >
          Tracks
        </button>
        <button 
          onClick={() => setActiveTab('liked')}
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'liked' ? 'electric-blue-bg text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 text-white/30 hover:text-white'}`}
        >
          Liked
        </button>
        <button 
          onClick={() => setActiveTab('nfts')}
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'nfts' ? 'electric-blue-bg text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 text-white/30 hover:text-white'}`}
        >
          Assets
        </button>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4">
        {activeTab === 'tracks' ? (
          filteredTracks.map(track => (
            <div key={track.id} className="flex-shrink-0 w-44 md:w-56">
              <TrackCard track={track} />
            </div>
          ))
        ) : activeTab === 'liked' ? (
          filteredLikedTracks.length > 0 ? (
            filteredLikedTracks.map(track => (
              <div key={track.id} className="flex-shrink-0 w-44 md:w-56">
                <TrackCard track={track} />
              </div>
            ))
          ) : (
            <div className="w-full py-20 text-center glass rounded-xl border-dashed border-white/5">
              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest italic">No frequencies saved in vault.</p>
            </div>
          )
        ) : (
          filteredNFTs.map(nft => (
            <div key={nft.id} className="flex-shrink-0 w-44 md:w-56">
              <NFTCard nft={nft} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;
