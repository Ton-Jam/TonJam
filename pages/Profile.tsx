import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_TRACKS, MOCK_NFTS, TON_LOGO, TJ_COIN_ICON, MOCK_POSTS } from '../constants';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';
import PlaylistCard from '../components/PlaylistCard';
import PostCard from '../components/PostCard';
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
    <div className="bg-[#080808] border border-white/5 p-6 rounded-lg group hover:border-blue-500/30 transition-all shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">{label}</span>
        {icon && <i className={`fas ${icon} text-[10px] text-blue-500/40 group-hover:text-blue-500 transition-colors`}></i>}
      </div>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-black italic tracking-tighter text-white leading-none">{value}</h4>
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
      <div className="relative h-[25vh] md:h-[40vh] w-full overflow-hidden bg-black">
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
      <div className="max-w-6xl mx-auto px-4 md:px-12 -mt-20 md:-mt-28 relative z-30 flex flex-col md:flex-row items-center md:items-end w-full gap-8 md:gap-12">
        
        {/* Left: Round Avatar centerpiece */}
        <div className="relative group md:mb-2 flex-shrink-0">
          <div className={`p-1.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-[0_0_50px_rgba(37,99,235,0.3)] transition-transform duration-500 group-hover:scale-105`}>
            <img 
              src={localUser.avatar} 
              className="w-28 h-28 md:w-44 md:h-44 rounded-full border-4 border-black object-cover" 
              alt={localUser.name} 
            />
          </div>
          {localUser.isVerifiedArtist && (
            <div className="absolute bottom-1.5 right-1.5 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-black shadow-xl">
              <i className="fas fa-check text-white text-[10px]"></i>
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
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          {/* Name & Handle */}
          <div className="mb-6 w-full">
            {isEditing ? (
              <input 
                type="text" 
                value={localUser.name} 
                onChange={(e) => setLocalUser({...localUser, name: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg px-6 py-3 text-4xl font-black italic tracking-tighter outline-none focus:border-blue-500 text-white w-full max-w-lg md:text-left"
              />
            ) : (
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-2">
                {localUser.name}
              </h1>
            )}
            <p className="text-blue-500 font-black text-sm md:text-base uppercase tracking-[0.6em] italic drop-shadow-md">
              {localUser.handle}
            </p>
          </div>

          {/* Stats Cluster (Followers/Collectors, Settings, Following) */}
          <div className="flex items-center gap-6 md:gap-10 mb-8">
            <div className="flex items-center gap-4 group">
              <div className="text-center md:text-left cursor-pointer">
                <p className="text-xl md:text-2xl font-black text-white italic leading-none group-hover:text-blue-400 transition-colors">
                  {localUser.followers.toLocaleString()}
                </p>
                <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-1">Collectors</p>
              </div>
              <Link 
                to="/settings" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 duration-500"
                title="Protocol Settings"
              >
                <i className="fas fa-cog text-xs md:text-base"></i>
              </Link>
            </div>

            <div className="text-center md:text-left group cursor-pointer">
              <p className="text-xl md:text-2xl font-black text-white italic leading-none group-hover:text-blue-400 transition-colors">
                {localUser.following.toLocaleString()}
              </p>
              <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-1">Following</p>
            </div>
          </div>

          {/* Edit/Save Actions */}
          <div className="flex gap-4 w-full max-w-xs md:max-w-none">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg"
              >
                Configure Identity
              </button>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => setIsEditing(false)} className="px-6 py-3.5 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">Abort</button>
                <button onClick={handleSave} className="px-8 py-3.5 electric-blue-bg text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95">Commit Sync</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar: Network Ledger */}
          <div className="lg:col-span-4 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <StatBlock label="Network Value" value={localUser.earnings} subValue="TON" icon="fa-gem" />
              <StatBlock label="Reward Credits" value="1,450" subValue="TJ" icon="fa-coins" />
            </div>

            <div className="bg-[#050505] border border-white/5 p-8 rounded-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><i className="fas fa-dna text-4xl"></i></div>
               <h3 className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6 italic">Neural Signature</h3>
               
               {isDNASyncing ? (
                 <div className="py-6 flex flex-col items-center gap-4">
                   <i className="fas fa-circle-notch animate-spin text-blue-500"></i>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Resonating frequencies...</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <p className="text-xs text-white/60 leading-relaxed italic border-l-2 border-blue-500/40 pl-6 py-2">
                      "Primary resonance: Deep House & Synthwave. Collector profile indicates a preference for high-bitrate genesis protocols and atmospheric textures."
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {['Atmospheric', 'Synth-Heavy', 'Collector', 'Curator'].map(tag => (
                         <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 rounded-md text-[7px] font-black text-white/40 uppercase tracking-widest">#{tag}</span>
                       ))}
                    </div>
                    <button onClick={handleSyncDNA} className="w-full py-3 border border-blue-500/20 rounded-md text-[8px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Re-Sync DNA</button>
                 </div>
               )}
            </div>

            <div className="bg-[#050505] border border-white/5 p-8 rounded-lg">
               <h3 className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-8 italic">Origin Narrative</h3>
               {isEditing ? (
                 <textarea 
                   value={localUser.bio}
                   onChange={(e) => setLocalUser({...localUser, bio: e.target.value})}
                   className="w-full bg-black border border-white/10 rounded-lg p-4 text-xs text-white outline-none focus:border-blue-500 h-32 italic leading-relaxed"
                   placeholder="Identify your frequency..."
                 />
               ) : (
                 <p className="text-xs text-white/40 leading-relaxed italic">{localUser.bio || "No biographical signals detected."}</p>
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