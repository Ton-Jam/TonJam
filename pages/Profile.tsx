import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_TRACKS, MOCK_NFTS, TON_LOGO, TJ_COIN_ICON, MOCK_POSTS, MOCK_ARTISTS } from '../constants';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';
import PlaylistCard from '../components/PlaylistCard';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import MintModal from '../components/MintModal';
import SellNFTModal from '../components/SellNFTModal';
import { useAudio } from '../context/AudioContext';
import { NFTItem, UserProfile } from '../types';
import { useTonAddress } from '@tonconnect/ui-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const userAddress = useTonAddress();
  const { addNotification, playlists, userProfile, setUserProfile } = useAudio();
  
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState<UserProfile>(userProfile);
  const [activeTab, setActiveTab] = useState<'inventory' | 'releases' | 'sequences' | 'activity'>('inventory');
  const [showMintModal, setShowMintModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedNftToSell, setSelectedNftToSell] = useState<NFTItem | null>(null);
  const [isDNASyncing, setIsDNASyncing] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setLocalUser(userProfile);
  }, [userProfile, isEditing]);

  const ownedNfts = useMemo(() => 
    MOCK_NFTS.filter(nft => nft.owner === localUser.walletAddress || nft.owner === userAddress), 
    [localUser.walletAddress, userAddress]
  );

  const userPosts = useMemo(() => 
    MOCK_POSTS.filter(p => p.userId === userProfile.id), 
    [userProfile.id]
  );

  const royaltyStats = useMemo(() => {
    // Simulate royalty calculations
    const streamingRevenue = MOCK_TRACKS.filter(t => t.artistId === localUser.id).reduce((acc, t) => acc + (t.playCount || 0) * 0.001, 0);
    const nftRevenue = MOCK_NFTS.filter(n => n.creator === localUser.name).reduce((acc, n) => acc + parseFloat(n.price) * (n.royalty || 0) / 100, 0);
    return {
      total: (streamingRevenue + nftRevenue).toFixed(2),
      streaming: streamingRevenue.toFixed(2),
      nft: nftRevenue.toFixed(2),
      pending: (Math.random() * 10).toFixed(2)
    };
  }, [localUser]);

  const handleSave = () => {
    setUserProfile(localUser);
    setIsEditing(false);
    addNotification("Neural identity committed to chain", "success");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalUser(prev => ({ ...prev, [type === 'avatar' ? 'avatar' : 'bannerUrl']: url }));
      addNotification(`${type.toUpperCase()} protocol updated`, 'success');
    }
  };

  const handleSyncDNA = () => {
    setIsDNASyncing(true);
    addNotification("Analyzing sonic frequencies...", "info");
    setTimeout(() => {
      setIsDNASyncing(false);
      addNotification("Neural DNA sync complete", "success");
    }, 2500);
  };

  const StatBlock = ({ label, value, icon, subValue }: { label: string, value: string, icon?: string, subValue?: string }) => (
    <div className="glass backdrop-blur-2xl bg-white/[0.02] border border-white/10 p-6 rounded-2xl group hover:border-blue-500/40 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/5 blur-2xl rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] italic leading-none">{label}</span>
        {icon && <i className={`fas ${icon} text-[10px] text-blue-500/50 group-hover:text-blue-400 transition-colors`}></i>}
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <h4 className="text-2xl font-black italic tracking-tighter text-white leading-none group-hover:text-blue-400 transition-colors">{value}</h4>
        {subValue && <span className="text-[10px] font-black text-blue-500 italic uppercase leading-none">{subValue}</span>}
      </div>
    </div>
  );

  const SectionHeader = ({ title, onAction, actionLabel }: { title: string, onAction?: () => void, actionLabel?: string }) => (
    <div className="flex items-center justify-between mb-6 px-4 md:px-0">
      <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.5em] italic flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
        {title}
      </h3>
      {onAction && (
        <button onClick={onAction} className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-all border-b border-blue-500/20 pb-0.5">{actionLabel || 'View All'}</button>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 pb-32">
      {/* Banner Section */}
      <div className="relative h-[20vh] md:h-[30vh] w-full overflow-hidden bg-black">
        <img src={localUser.bannerUrl} className="w-full h-full object-cover opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        {isEditing && (
          <button onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity z-20">
             <div className="bg-white/10 border border-white/20 p-4 rounded-lg"><i className="fas fa-camera text-white text-xl"></i></div>
          </button>
        )}
        <input type="file" hidden ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" />
      </div>

      {/* IDENTITY SECTION: Avatar Round on the left, Stats on the right */}
      <div className="max-w-6xl mx-auto px-4 md:px-12 -mt-16 md:-mt-20 relative z-30 flex flex-col md:flex-row items-center md:items-end w-full gap-6 md:gap-10">
        
        {/* Left: Round Avatar centerpiece */}
        <div className="relative group md:mb-2 flex-shrink-0">
          <div className={`p-1.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-[0_0_50px_rgba(37,99,235,0.3)] transition-transform duration-500 group-hover:scale-105`}>
            <img 
              src={localUser.avatar} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black object-cover" 
              alt={localUser.name} 
            />
          </div>
          {localUser.isVerifiedArtist && (
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-black shadow-xl">
              <i className="fas fa-check text-white text-[8px]"></i>
            </div>
          )}
          {isEditing && (
            <button 
              onClick={() => avatarInputRef.current?.click()} 
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-pencil text-white"></i>
            </button>
          )}
          <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
        </div>

        {/* Right: Name, Handle, Stats, and Actions */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-4 mb-6">
            {/* Name & Handle */}
            <div className="w-full md:w-auto">
              {isEditing ? (
                <input 
                  type="text" 
                  value={localUser.name} 
                  onChange={(e) => setLocalUser({...localUser, name: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-2xl md:text-3xl font-black italic tracking-tighter outline-none focus:border-blue-500 text-white w-full max-w-lg md:text-left"
                />
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <h1 
                    onClick={() => setIsEditing(true)}
                    className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] cursor-pointer hover:text-blue-400 transition-colors group/name relative"
                  >
                    {localUser.name}
                  </h1>
                  {localUser.isVerifiedArtist && <i className="fas fa-check-circle text-blue-500 text-xl md:text-2xl"></i>}
                </div>
              )}
              <p className="text-blue-500 font-black text-xs md:text-sm uppercase tracking-[0.6em] italic drop-shadow-md">
                {localUser.handle}
              </p>
            </div>

            {/* Edit/Save Actions */}
            <div className="flex gap-3 justify-center md:justify-end">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg flex items-center gap-2"
                >
                  <i className="fas fa-pencil"></i> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">Abort</button>
                  <button onClick={handleSave} className="px-5 py-2 electric-blue-bg text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95">Save</button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cluster (Followers/Collectors, Settings, Following) */}
          <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8 mb-4">
            <div className="flex items-center gap-3 group">
              <div className="text-center md:text-left cursor-pointer">
                <p className="text-lg md:text-xl font-black text-white italic leading-none group-hover:text-blue-400 transition-colors">
                  {localUser.followers.toLocaleString()}
                </p>
                <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-1">Collectors</p>
              </div>
              <Link 
                to="/settings" 
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 duration-500"
                title="Protocol Settings"
              >
                <i className="fas fa-cog text-[10px] md:text-xs"></i>
              </Link>
            </div>

            <div className="text-center md:text-left group cursor-pointer">
              <p className="text-lg md:text-xl font-black text-white italic leading-none group-hover:text-blue-400 transition-colors">
                {localUser.following.toLocaleString()}
              </p>
              <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-1">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar: Network Ledger */}
          <div className="lg:col-span-4 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <StatBlock label="Network Value" value={localUser.earnings} subValue="TON" icon="fa-gem" />
              <StatBlock label="Reward Credits" value="1,450" subValue="TJ" icon="fa-coins" />
            </div>

            <div className="glass backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-dna text-4xl text-blue-500"></i></div>
               <div className="absolute -left-20 -top-20 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>
               <h3 className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6 italic relative z-10">Neural Signature</h3>
               
               {isDNASyncing ? (
                 <div className="py-6 flex flex-col items-center gap-4 relative z-10">
                   <i className="fas fa-circle-notch animate-spin text-blue-500"></i>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Resonating frequencies...</p>
                 </div>
               ) : (
                 <div className="space-y-6 relative z-10">
                    <p className="text-xs text-white/60 leading-relaxed italic border-l-2 border-blue-500/40 pl-6 py-2">
                      "Primary resonance: Deep House & Synthwave. Collector profile indicates a preference for high-bitrate genesis protocols and atmospheric textures."
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {['Atmospheric', 'Synth-Heavy', 'Collector', 'Curator'].map(tag => (
                         <span key={tag} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[7px] font-black text-blue-400 uppercase tracking-widest">#{tag}</span>
                       ))}
                    </div>
                    <button onClick={handleSyncDNA} className="w-full py-3 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[8px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/5">Re-Sync DNA</button>
                 </div>
               )}
            </div>

            <div className="glass backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden">
               <h3 className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-8 italic">Origin Narrative</h3>
               {isEditing ? (
                 <textarea 
                   value={localUser.bio}
                   onChange={(e) => setLocalUser({...localUser, bio: e.target.value})}
                   className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500 h-32 italic leading-relaxed backdrop-blur-md"
                   placeholder="Identify your frequency..."
                 />
               ) : (
                 <div 
                   onClick={() => setIsEditing(true)}
                   className="cursor-pointer group/bio relative"
                 >
                   <p className="text-xs text-white/40 leading-relaxed italic group-hover:text-white/60 transition-colors">
                     {localUser.bio || "No biographical signals detected."}
                   </p>
                   <i className="fas fa-pencil text-[8px] text-blue-500 absolute -top-4 right-0 opacity-0 group-hover/bio:opacity-100 transition-opacity"></i>
                 </div>
               )}
            </div>

            {/* Verification Link */}
            {!localUser.isVerifiedArtist && (
              <button className="w-full py-5 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-lg text-[#1DB954] text-[9px] font-black uppercase tracking-widest hover:bg-[#1DB954] hover:text-white transition-all flex items-center justify-center gap-3">
                <i className="fab fa-spotify text-sm"></i>
                Verify Artist Identity
              </button>
            )}
          </div>

          {/* Right Content: Inventories */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* INVENTORY SECTION */}
            <section>
              <SectionHeader title="Digital Vault" actionLabel="Manage Assets" onAction={() => navigate('/library')} />
              <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-4 md:px-0">
                {ownedNfts.length > 0 ? (
                  ownedNfts.map(nft => (
                    <div key={nft.id} className="flex-shrink-0 w-44 md:w-52">
                      <NFTCard nft={nft} onSell={(n) => { setSelectedNftToSell(n); setShowSellModal(true); }} />
                    </div>
                  ))
                ) : (
                  <div 
                    onClick={() => navigate('/marketplace')}
                    className="w-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-lg group cursor-pointer hover:border-blue-500/20 transition-all"
                  >
                    <i className="fas fa-plus text-white/10 text-xl mb-4 group-hover:text-blue-500 transition-colors"></i>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Zero assets detected. Sync from market.</p>
                  </div>
                )}
              </div>
            </section>

            {/* RELEASES SECTION (If Artist) */}
            {(localUser.isVerifiedArtist || MOCK_TRACKS.some(t => t.artistId === localUser.id)) && (
              <>
                <section>
                  <SectionHeader title="Authored Protocols" actionLabel="Mint New" onAction={() => setShowMintModal(true)} />
                  <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-4 md:px-0">
                    {MOCK_TRACKS.slice(0, 5).map(track => (
                      <div key={track.id} className="flex-shrink-0 w-44 md:w-52">
                        <TrackCard track={track} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* ROYALTIES SECTION */}
                <section className="glass backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-chart-line text-4xl text-blue-500"></i></div>
                  <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>
                  <SectionHeader title="Royalty Distribution Ledger" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
                    <div>
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] italic block mb-1">Total Earned</span>
                      <span className="text-2xl font-black italic tracking-tighter text-white">{royaltyStats.total} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] italic block mb-1">Streaming</span>
                      <span className="text-xl font-black italic tracking-tighter text-white">{royaltyStats.streaming} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] italic block mb-1">NFT Royalties</span>
                      <span className="text-xl font-black italic tracking-tighter text-white">{royaltyStats.nft} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.4em] italic block mb-1">Pending Sync</span>
                      <span className="text-xl font-black italic tracking-tighter text-amber-500">{royaltyStats.pending} <span className="text-[10px]">TON</span></span>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic mb-4">Recent Distributions</h4>
                    <div className="space-y-2">
                      {[
                        { id: 1, type: 'Streaming', amount: '2.4', date: 'Today, 14:30', track: 'Solar Pulse' },
                        { id: 2, type: 'NFT Resale', amount: '0.9', date: 'Yesterday', track: 'Deep Horizon #042' },
                        { id: 3, type: 'Streaming', amount: '1.1', date: 'Oct 24', track: 'Cyber Drift' }
                      ].map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'Streaming' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                              <i className={`fas ${tx.type === 'Streaming' ? 'fa-play' : 'fa-gem'} text-[10px]`}></i>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white uppercase italic">{tx.type} Revenue</p>
                              <p className="text-[8px] text-white/40 uppercase tracking-widest">{tx.track}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-green-400 italic">+{tx.amount} TON</p>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-3 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[8px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/5">
                      Withdraw to Wallet
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* SEQUENCES SECTION */}
            <section>
              <SectionHeader title="Sync Sequences" onAction={() => navigate('/library')} />
              <div className="flex overflow-x-auto no-scrollbar gap-6 pb-6 px-4 md:px-0">
                {playlists.map(pl => (
                  <PlaylistCard key={pl.id} playlist={pl} onClick={() => navigate('/library')} />
                ))}
                <div 
                  onClick={() => navigate('/library')}
                  className="flex-shrink-0 w-40 md:w-48 aspect-square border-2 border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center group cursor-pointer hover:border-blue-500/20 transition-all"
                >
                  <i className="fas fa-plus text-white/10 mb-4 group-hover:text-blue-500 transition-colors"></i>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">New Sequence</span>
                </div>
              </div>
            </section>

            {/* FEED SECTION */}
            <section>
              <SectionHeader title="Signal History" onAction={() => navigate('/jamspace')} />
              <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-4 md:px-0">
                {userPosts.length > 0 ? (
                  userPosts.map(post => (
                    <div key={post.id} className="flex-shrink-0 w-72 md:w-80">
                      <PostCard post={post} />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-lg">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Signal void detected.</p>
                  </div>
                )}
              </div>
            </section>

            {/* RECOMMENDATIONS SECTION */}
            <section className="glass backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><i className="fas fa-satellite-dish text-4xl text-blue-500"></i></div>
              <SectionHeader title="Network Suggestions" />
              
              <div className="space-y-8 relative z-10">
                <div>
                  <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic mb-4">Suggested Nodes</h4>
                  <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                    {MOCK_ARTISTS.slice(0, 4).map(artist => (
                      <div key={artist.id} className="flex-shrink-0 w-48">
                        <UserCard user={artist} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic mb-4">Curated Frequencies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {MOCK_TRACKS.slice(0, 4).map(track => (
                      <TrackCard key={track.id} track={track} variant="row" />
                    ))}
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Modals */}
      {showMintModal && <MintModal onClose={() => setShowMintModal(false)} />}
      {showSellModal && selectedNftToSell && (
        <SellNFTModal nft={selectedNftToSell} onClose={() => {
          setShowSellModal(false);
          setSelectedNftToSell(null);
        }} />
      )}
    </div>
  );
};

export default Profile;