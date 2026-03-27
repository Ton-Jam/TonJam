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
import { getPlaceholderImage } from '@/lib/utils';
import { ProfileCard } from '@/components/ProfileCard';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 pt-8">
        <ProfileCard
          name={user.name}
          title={user.handle}
          bannerUrl={user.bannerUrl || getPlaceholderImage(`user-banner-${user.id}`, 1200, 400)}
          avatarUrl={user.avatar}
          stats={{
            followers: user.followers.toLocaleString(),
            following: user.following.toLocaleString(),
            assets: ownedNfts.length.toString()
          }}
          onFollow={handleFollow}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 mt-8 relative z-10">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-8 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'inventory', label: 'Inventory', icon: Box },
            { id: 'activity', label: 'Activity', icon: Layers },
            { id: 'network', label: 'Network', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap rounded-full ${
                activeTab === tab.id 
                  ? 'bg-foreground text-background' 
                  : 'bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
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
                  <div className="bg-muted/20 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
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
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-4">
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
                <div className="bg-muted/20 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
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
                  <div className="bg-muted/20 p-8 rounded-2xl text-center">
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
                 <div className="bg-muted/20 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
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
