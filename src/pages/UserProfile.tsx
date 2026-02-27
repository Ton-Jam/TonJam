import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Users, 
  Layers, 
  Disc, 
  Box, 
  ArrowLeft,
  Gem
} from 'lucide-react';

import { MOCK_USERS, MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import SocialFeed from '@/components/SocialFeed';
import { useAudio } from '@/context/AudioContext';
import { UserProfile as UserProfileType } from '@/types';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allTracks, allNFTs, userProfile, toggleFollowUser } = useAudio();
  
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'activity' | 'network'>('inventory');

  useEffect(() => {
    // If the ID matches the current user, redirect to their profile
    if (id === userProfile.id) {
      navigate('/profile');
      return;
    }

    const foundUser = MOCK_USERS.find(u => u.id === id);
    if (foundUser) {
      setUser(foundUser);
    } else {
      // Handle not found
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [id, userProfile.id, navigate]);

  const isFollowing = useMemo(() => {
    return userProfile.friends?.includes(id || '') || false;
  }, [userProfile.friends, id]);

  const handleFollow = () => {
    if (id) {
      toggleFollowUser(id);
    }
  };

  const userPosts = useMemo(() => {
    if (!user) return [];
    return MOCK_POSTS.filter(p => p.userId === user.id);
  }, [user]);

  const ownedNfts = useMemo(() => {
    if (!user) return [];
    return allNFTs.filter(nft => nft.owner === user.walletAddress || nft.owner === user.name);
  }, [user, allNFTs]);

  const uploadedTracks = useMemo(() => {
    if (!user) return [];
    return allTracks.filter(t => t.artistId === user.id);
  }, [user, allTracks]);

  if (!user) return null;

  return (
    <div className="animate-in fade-in duration-1000 pb-32">
      {/* Banner Section */}
      <div className="relative h-[20vh] md:h-[30vh] w-full overflow-hidden bg-black">
        <img src={user.bannerUrl || `https://picsum.photos/1200/400?random=${user.id}`} className="w-full h-full object-cover opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar & Basic Info */}
          <div className="flex-shrink-0 relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-black bg-zinc-900 shadow-2xl relative z-10">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            {user.isVerifiedArtist && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-xl border-4 border-black z-20 shadow-lg" title="Verified Artist">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 pt-4 md:pt-36 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase">{user.name}</h1>
                <div className="flex items-center gap-4 text-sm font-bold text-white/40 uppercase tracking-widest">
                  <span>{user.handle}</span>
                  {user.walletAddress && (
                    <>
                      <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                      <span className="text-blue-500">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleFollow}
                  className={`px-8 py-4 rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                    isFollowing 
                      ? 'bg-white/10 text-white hover:bg-white/20' 
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>

            {user.bio && (
              <p className="mt-6 text-sm text-white/60 max-w-2xl leading-relaxed font-medium">
                {user.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-white/5">
              <div>
                <div className="text-2xl font-black text-white">{user.followers.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{user.following.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Following</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{ownedNfts.length}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Assets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-8 mt-12 border-b border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'inventory', label: 'Inventory', icon: Box },
            { id: 'activity', label: 'Activity', icon: Layers },
            { id: 'network', label: 'Network', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors whitespace-nowrap relative ${
                activeTab === tab.id ? 'text-blue-500' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'inventory' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Owned NFTs */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.5em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Digital Assets
                  </h3>
                </div>
                
                {ownedNfts.length > 0 ? (
                  <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                    {ownedNfts.map(nft => (
                      <div key={nft.id} className="min-w-[280px] sm:min-w-[320px]">
                        <NFTCard nft={nft} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass p-12 rounded-[10px] border border-white/5 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Gem className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No assets acquired yet</p>
                  </div>
                )}
              </div>

              {/* Uploaded Tracks (if any) */}
              {uploadedTracks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.5em] flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Uploaded Tracks
                    </h3>
                  </div>
                  
                  <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                    {uploadedTracks.map((track, index) => (
                      <div key={track.id} className="min-w-[280px] sm:min-w-[320px]">
                        <TrackCard track={track} index={index} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {userPosts.length > 0 ? (
                <SocialFeed initialPosts={userPosts} />
              ) : (
                <div className="glass p-12 rounded-[10px] border border-white/5 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No recent activity</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'network' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass p-12 rounded-[10px] border border-white/5 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Network data encrypted</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
