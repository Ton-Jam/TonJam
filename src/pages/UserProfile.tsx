import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Users, 
  Layers, 
  Disc, 
  Box, 
  ArrowLeft,
  Gem,
  Share2
} from 'lucide-react';

import { MOCK_USERS, MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, MOCK_ARTISTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import ArtistListItem from '@/components/ArtistListItem';
import SocialFeed from '@/components/SocialFeed';
import { useAudio } from '@/context/AudioContext';
import { UserProfile as UserProfileType } from '@/types';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allTracks, allNFTs, userProfile, toggleFollowUser, followedUserIds, addNotification } = useAudio();
  
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
    return followedUserIds.includes(id || '');
  }, [followedUserIds, id]);

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
    <div className="animate-in fade-in duration-1000 pb-4">
      {/* Banner Section */}
      <div className="relative h-[20vh] md:h-[30vh] w-full overflow-hidden bg-background">
        <img src={user.bannerUrl || `https://picsum.photos/1200/400?random=${user.id}`} className="w-full h-full object-cover opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 -mt-4 md:-mt-4 relative z-10">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          
          {/* Avatar & Basic Info */}
          <div className="flex-shrink-0 relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-background bg-muted shadow-2xl relative z-10">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            {user.isVerifiedArtist && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-foreground p-4 rounded-xl border-4 border-black z-20 shadow-lg" title="Verified Artist">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 pt-4 md:pt-4 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-[26px] md:text-[44px] font-black tracking-tighter text-foreground mb-4 uppercase">{user.name}</h1>
                <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  <span>{user.handle}</span>
                  {user.walletAddress && (
                    <>
                      <span className="w-1 h-1 bg-muted/80 rounded-full"></span>
                      <span className="text-blue-500">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleFollow}
                  className={`px-4 py-4 rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 ${
                    isFollowing 
                      ? 'bg-muted text-foreground hover:bg-muted/80' 
                      : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-sm text-muted-foreground/80 max-w-2xl leading-relaxed font-medium">
                {user.bio}
              </p>
            )}

            {/* Friends Avatars */}
            {user.friends && user.friends.length > 0 && (
              <div className="mt-4 flex items-center gap-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-4">Friends:</span>
                <div className="flex -space-x-4">
                  {user.friends.slice(0, 5).map(friendId => {
                    const friend = MOCK_USERS.find(u => u.id === friendId);
                    if (!friend) return null;
                    return (
                      <Link key={friend.id} to={`/user/${friend.id}`} title={friend.name}>
                        <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50">
              <div>
                <div className="text-[20px] font-black text-foreground">{user.followers.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">Followers</div>
              </div>
              <div>
                <div className="text-[20px] font-black text-foreground">{user.following.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">Following</div>
              </div>
              <div>
                <div className="text-[20px] font-black text-foreground">{ownedNfts.length}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">Assets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mt-4 border-b border-border/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'inventory', label: 'Inventory', icon: Box },
            { id: 'activity', label: 'Activity', icon: Layers },
            { id: 'network', label: 'Network', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-4 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors whitespace-nowrap relative ${
                activeTab === tab.id ? 'text-blue-500' : 'text-muted-foreground hover:text-muted-foreground/90'
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
        <div className="mt-4">
          {activeTab === 'inventory' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Owned NFTs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.5em] flex items-center gap-4">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Digital Assets
                  </h3>
                </div>
                
                {ownedNfts.length > 0 ? (
                  <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                    {ownedNfts.map(nft => (
                      <div key={nft.id} className="min-w-[280px] sm:min-w-[320px]">
                        <NFTCard nft={nft} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass p-4 rounded-[10px] border border-border/50 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Gem className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No assets acquired yet</p>
                  </div>
                )}
              </div>

              {/* Uploaded Tracks (if any) */}
              {uploadedTracks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.5em] flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Uploaded Tracks
                    </h3>
                  </div>
                  
                  <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
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
                <SocialFeed posts={userPosts} />
              ) : (
                <div className="glass p-4 rounded-[10px] border border-border/50 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No recent activity</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'network' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              {/* Followed Artists */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.5em] flex items-center gap-4">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Followed Artists
                  </h3>
                </div>
                
                {user.followedArtists && user.followedArtists.length > 0 ? (
                  <div className="flex flex-col gap-4">
                     {user.followedArtists.map(artistId => {
                        const artist = MOCK_ARTISTS.find(a => a.id === artistId);
                        if (!artist) return null;
                        return <ArtistListItem key={artist.id} artist={artist} />;
                     })}
                  </div>
                ) : (
                  <div className="glass p-4 rounded-[10px] border border-border/50 text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Not following any artists</p>
                  </div>
                )}
              </div>

              {/* Friends / Network */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.5em] flex items-center gap-4">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    Network Connections
                  </h3>
                </div>
                 <div className="glass p-4 rounded-[10px] border border-border/50 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Network data encrypted</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
