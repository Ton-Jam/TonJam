import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Flame, Heart, Sparkles, ChevronRight, Compass, Zap, 
  ListMusic, Award, Radio, AlertCircle, Music, Trophy, Wallet, 
  TrendingUp, Users, MessageSquare, BarChart3, HelpCircle, Smartphone 
} from 'lucide-react';

// --- CONTEXT IMPORTS ---
import { useAudio } from '../contexts/AudioContext';
import { useNFT } from '../contexts/NFTContext';
import { useTask } from '../contexts/TaskContext';
import { getPlaceholderImage } from '../lib/utils';

// --- CARDS IMPORTS ---
import { 
  TrackCard, CompactTrackCard, NowPlayingCard, QueueCard, 
  RecommendedTrackCard, TrendingTrackCard, RecentlyPlayedCard, 
  MusicHistoryCard, AlbumCard, PlaylistCard, FavoritePlaylistCard 
} from '../components/cards/music/MusicCards';

import { 
  NFTCard, MarketplaceCard, FeaturedNFTCard, TrendingNFTCard, 
  AuctionCard, FloorPriceCard, BidCard, CollectionCard, MintCard, 
  MarketplaceAnalyticsCard 
} from '../components/cards/nft/NFTCards';
import FeaturedAuctionCard from '../components/FeaturedAuctionCard';

import { 
  ArtistCard, FeaturedArtistCard, VerifiedArtistCard, TopArtistCard, 
  SuggestedArtistCard, ArtistStatsCard 
} from '../components/cards/artist/ArtistCards';

import { 
  FeedCard, CommentCard, CommunityCard, SpaceCard, LiveSpaceCard, 
  AnnouncementCard, EventCard 
} from '../components/cards/feed/SocialCards';

import { 
  ProfileSummaryCard, AchievementsCard, FollowersCard, FollowingCard, 
  FavoriteArtistsCard 
} from '../components/cards/profile/ProfileCards';

import { 
  MissionCard, DailyRewardCard, StreakCard, ReferralCard, XPCard, 
  LeaderboardCard, ChallengeCard, BonusRewardCard 
} from '../components/cards/task/TaskCards';

import { 
  WalletBalanceCard, PortfolioCard, TokenCard, TransactionCard, 
  ActivityCard, RewardCard 
} from '../components/cards/wallet/WalletCards';

import { 
  StreamsCard, RevenueCard, FloorPriceAnalytics, MarketplaceVolume, 
  TopSellers, TopBuyers, TopCollections, FollowersGrowth, 
  EngagementCard, ListeningAnalytics 
} from '../components/cards/analytics/AnalyticsCards';

import { 
  HeroBanner, SponsoredFeedCard, TrendingBanner, RecommendationCard, 
  DiscoverCard, QuickActionCard, ContinueListeningCard 
} from '../components/cards/home/HomeCards';

const FALLBACK_TRACK: any = {
  id: 'preview-track',
  title: 'No Active Track',
  artist: 'TonJam Creator',
  coverUrl: getPlaceholderImage('track'),
  audioUrl: '',
  duration: 0,
  playCount: 0,
  isNFT: false,
  isVerified: true,
};

const FALLBACK_ARTIST: any = {
  id: 'preview-artist',
  name: 'TonJam Artist',
  handle: '@tonjam',
  avatarUrl: getPlaceholderImage('artist'),
  genre: 'Electronic',
  followers: 0,
  monthlyListeners: 0,
  verified: true,
};

const FALLBACK_COLLECTION: any = {
  id: 'preview-col',
  title: 'Collection',
  creator: 'TonJam',
  coverUrl: getPlaceholderImage('nft'),
  itemCount: 0,
  floorPrice: '0',
};

const FALLBACK_ALBUM: any = {
  id: 'preview-album',
  title: 'Album',
  artist: 'TonJam Artist',
  coverUrl: getPlaceholderImage('album'),
  trackCount: 0,
};

const FALLBACK_PLAYLIST: any = {
  id: 'preview-playlist',
  title: 'Playlist',
  creator: 'TonJam',
  coverUrl: getPlaceholderImage('playlist'),
  trackCount: 0,
};

const FALLBACK_POST: any = {
  id: 'preview-post',
  authorName: 'TonJam Creator',
  authorAvatar: getPlaceholderImage('artist'),
  content: 'No posts available yet.',
  createdAt: new Date().toISOString(),
  likes: 0,
  comments: 0,
};

const FALLBACK_MISSION: any = {
  id: 'preview-mission',
  title: 'Complete Profile',
  description: 'Connect your TON wallet and explore live music.',
  reward: 50,
  isCompleted: false,
};

const mapTrackToNFT = (track?: any): any => ({
  id: track?.id || 'preview-nft',
  title: track?.title || 'Untitled NFT',
  creator: track?.artist || 'TonJam Creator',
  imageUrl: track?.coverUrl || getPlaceholderImage('nft'),
  price: track?.price || '0',
  highestBid: '0',
  supplyTotal: 1,
  supplyMinted: 0,
  mintStatus: 'open',
  isVerified: Boolean(track?.isVerified),
});

export const UIKitShowcase: React.FC = () => {
  const navigate = useNavigate();
  const {
    allTracks: liveTracks = [],
    artists: liveArtists = [],
    playlists: livePlaylists = [],
    posts: livePosts = [],
  } = useAudio();
  const { nfts: liveNfts = [] } = useNFT();
  const { tasks: liveTasks = [] } = useTask();

  const tracks = liveTracks.length > 0 ? liveTracks : [FALLBACK_TRACK];
  const nftTracks = liveNfts.length > 0 ? liveNfts : liveTracks.filter((t) => t.isNFT);
  const artists = liveArtists.length > 0 ? liveArtists : [FALLBACK_ARTIST];
  const albums = [FALLBACK_ALBUM];
  const playlists = livePlaylists.length > 0 ? livePlaylists : [FALLBACK_PLAYLIST];
  const collections = [FALLBACK_COLLECTION];
  const feedPosts = livePosts.length > 0 ? livePosts : [FALLBACK_POST];
  const missions = liveTasks.length > 0 ? liveTasks : [FALLBACK_MISSION];

  const getTrack = (i: number) => tracks[i] || tracks[0] || FALLBACK_TRACK;
  const getArtist = (i: number) => artists[i] || artists[0] || FALLBACK_ARTIST;
  const getAlbum = (i: number) => albums[i] || FALLBACK_ALBUM;
  const getPlaylist = (i: number) => playlists[i] || playlists[0] || FALLBACK_PLAYLIST;
  const getCollection = (i: number) => collections[i] || FALLBACK_COLLECTION;
  const getNftTrack = (i: number) => nftTracks[i] || nftTracks[0] || FALLBACK_TRACK;
  const getPost = (i: number) => feedPosts[i] || feedPosts[0] || FALLBACK_POST;
  const getMission = (i: number) => missions[i] || missions[0] || FALLBACK_MISSION;

  const [activeTab, setActiveTab] = useState<'music' | 'nft' | 'artists' | 'social' | 'tasks' | 'wallet' | 'analytics' | 'home'>('music');
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlayingTrack, setNowPlayingTrack] = useState<any>(getTrack(0));

  // Handle playing music
  const handlePlayTrack = (track: any) => {
    if (!track) return;
    setNowPlayingTrack(track);
    setIsPlaying(true);
  };

  const tabs = [
    { id: 'music', label: 'Music', icon: <Music className="w-4 h-4" /> },
    { id: 'nft', label: 'NFT & Web3', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'artists', label: 'Artists', icon: <Users className="w-4 h-4" /> },
    { id: 'social', label: 'Feed & Social', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'tasks', label: 'Quests', icon: <Trophy className="w-4 h-4" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'home', label: 'Home Page', icon: <Compass className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="bg-[#050A24] min-h-screen text-white select-none">
      {/* Title Header banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">TonJam OS v2.0</span>
            <span className="text-[10px] text-white/50 font-mono">Premium Android Music UX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 uppercase tracking-tight">Cards UI Component Library</h1>
          <p className="text-xs text-white/70 mt-1 max-w-xl">
            Clean, high-fidelity components built for The Open Network (GRAM) creator economy. Free of borders, optimized for fast rendering.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/unified-design-system')}
            className="p-3 bg-[#2E8CEB] hover:bg-[#2577c9] active:scale-95 text-white rounded-lg flex items-center gap-2 font-mono text-xs font-bold transition-all shadow-md"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile 3-Screen System</span>
          </button>
          <div className="p-3 bg-white/5 rounded-lg text-center min-w-20 font-mono">
            <span className="text-[9px] uppercase tracking-wider text-white/50 block">Components</span>
            <span className="text-lg font-black text-blue-400">55+</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center min-w-20 font-mono">
            <span className="text-[9px] uppercase tracking-wider text-white/50 block">Durable</span>
            <span className="text-lg font-black text-emerald-400">100%</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="flex gap-1 overflow-x-auto p-4 bg-[#0A113A]/55 scrollbar-none sticky top-0 z-40 backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white/5 text-[#9AA0AE] hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Core Showcase body panel */}
      <div className="p-6 max-w-7xl mx-auto space-y-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-12"
          >
            {/* MUSIC SECTION */}
            {activeTab === 'music' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Now Playing & Controls</h3>
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <NowPlayingCard 
                      track={nowPlayingTrack} 
                      isPlaying={isPlaying} 
                      onTogglePlay={() => setIsPlaying(!isPlaying)}
                      onNext={() => handlePlayTrack(getTrack(Math.floor(Math.random() * tracks.length)))}
                      onPrev={() => handlePlayTrack(getTrack(Math.floor(Math.random() * tracks.length)))}
                    />
                    <div className="space-y-4 flex-1 w-full">
                      <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Active Playing Queue</h4>
                      <div className="space-y-2">
                        {tracks.slice(0, 3).map((t, idx) => (
                          <QueueCard 
                            key={t.id} 
                            track={t} 
                            index={idx} 
                            onPlay={() => handlePlayTrack(t)}
                            onRemove={() => {}}
                          />
                        ))}
                      </div>
                      <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest mt-6">Continue Resume Widget</h4>
                      <ContinueListeningCard 
                        track={{
                          id: nowPlayingTrack.id,
                          title: nowPlayingTrack.title,
                          artist: nowPlayingTrack.artist,
                          coverUrl: nowPlayingTrack.coverUrl,
                          progressPercent: 68
                        }}
                        isPlaying={isPlaying}
                        onTogglePlay={() => setIsPlaying(!isPlaying)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Track Cards & Skeletons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TrackCard 
                      track={getTrack(0)} 
                      isPlaying={isPlaying && nowPlayingTrack.id === getTrack(0).id} 
                      onPlay={handlePlayTrack} 
                    />
                    <TrackCard isLoading />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Dynamic Track Feeds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Trending Track</h4>
                      <TrendingTrackCard track={getTrack(1)} onPlay={() => handlePlayTrack(getTrack(1))} />
                      <TrendingTrackCard track={getTrack(2)} onPlay={() => handlePlayTrack(getTrack(2))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Recently Played Log</h4>
                      <RecentlyPlayedCard track={getTrack(3)} onPlay={() => handlePlayTrack(getTrack(3))} />
                      <MusicHistoryCard track={getTrack(4)} onPlay={() => handlePlayTrack(getTrack(4))} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Albums & Playlists</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    <AlbumCard album={getAlbum(0)} onPlay={() => handlePlayTrack(getTrack(0))} />
                    <AlbumCard album={getAlbum(1)} onPlay={() => handlePlayTrack(getTrack(1))} />
                    <PlaylistCard playlist={getPlaylist(0)} onPlay={() => handlePlayTrack(getTrack(2))} />
                    <PlaylistCard playlist={getPlaylist(1)} onPlay={() => handlePlayTrack(getTrack(3))} />
                  </div>
                  <div className="mt-4">
                    <FavoritePlaylistCard playlist={getPlaylist(2)} onPlay={() => handlePlayTrack(getTrack(4))} />
                  </div>
                </div>
              </div>
            )}

            {/* NFT SECTION */}
            {activeTab === 'nft' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-black tracking-widest text-purple-400 uppercase mb-4">Featured Launchpad</h3>
                  <FeaturedNFTCard nft={mapTrackToNFT(getNftTrack(0))} onMint={() => {}} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest mb-3">Live Auction (Featured Audio NFT)</h4>
                    <FeaturedAuctionCard 
                      nft={{
                        id: getNftTrack(1).id,
                        title: getNftTrack(1).title,
                        creator: getNftTrack(1).artist || 'TonJam Artist',
                        imageUrl: getNftTrack(1).coverUrl || getPlaceholderImage('nft'),
                        currentBid: '0 TON',
                        floorPrice: '0 TON',
                      }} 
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest mb-3">Bids Feed</h4>
                    <div className="space-y-2.5">
                      <BidCard nft={{ ...mapTrackToNFT(getNftTrack(2)), highestBid: '32.5', bidderName: '@collector', bidTime: '2m ago' }} />
                      <BidCard nft={{ ...mapTrackToNFT(getNftTrack(3)), highestBid: '28.0', bidderName: '@listener', bidTime: '15m ago' }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest mb-3">Floor Analytics</h4>
                    <div className="space-y-2.5">
                      <FloorPriceCard title="Collection Floor" floorPrice="0" change24h={0} volume24h="0" />
                      <MarketplaceAnalyticsCard totalVolume="0" totalSales={0} activeListings={0} ownersRatio="0%" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-purple-400 uppercase mb-4">NFT Collections & Launch</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    <NFTCard nft={mapTrackToNFT(getNftTrack(4))} />
                    <NFTCard nft={mapTrackToNFT(getNftTrack(5))} />
                    <CollectionCard collection={getCollection(0)} />
                    <CollectionCard collection={getCollection(1)} />
                  </div>
                  <div className="mt-4">
                    <MintCard nft={{ ...mapTrackToNFT(getNftTrack(6)), supplyMinted: 0, supplyTotal: 1 }} />
                  </div>
                </div>
              </div>
            )}

            {/* ARTISTS SECTION */}
            {activeTab === 'artists' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Artist of the Week</h3>
                  <FeaturedArtistCard artist={getArtist(0)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Artist Metrics</h4>
                    <ArtistStatsCard artist={getArtist(0)} />
                    <VerifiedArtistCard artist={getArtist(1)} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Leaderboard Rankings</h4>
                    <TopArtistCard artist={getArtist(2)} rank={1} />
                    <TopArtistCard artist={getArtist(3)} rank={2} />
                    <TopArtistCard artist={getArtist(4)} rank={3} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Creators Roster</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    <ArtistCard artist={getArtist(5)} />
                    <ArtistCard artist={getArtist(6)} />
                    <SuggestedArtistCard artist={getArtist(7)} reason="TonJam Creator" />
                    <SuggestedArtistCard artist={getArtist(8)} reason="Electronic" />
                  </div>
                </div>
              </div>
            )}

            {/* SOCIAL SECTION */}
            {activeTab === 'social' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Interactive Audio Spaces</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    <LiveSpaceCard 
                      space={{
                        id: 's1',
                        title: 'TonJam Live Audio Space',
                        hostName: getArtist(0).name,
                        hostAvatar: getArtist(0).avatarUrl,
                        listenersCount: 0
                      }} 
                    />
                    <SpaceCard 
                      space={{
                        id: 's2',
                        title: 'Community Jam & Listening Session',
                        hostName: getArtist(1).name,
                        hostAvatar: getArtist(1).avatarUrl,
                        scheduledTime: 'Upcoming',
                        listenersCount: 0,
                        avatars: [getArtist(2).avatarUrl, getArtist(3).avatarUrl, getArtist(4).avatarUrl]
                      }} 
                    />
                    <CommunityCard name="TonJam Radio Hub" membersCount={0} category="Web3 FM" onlineCount={0} avatarUrl={getArtist(5).avatarUrl} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Social Status Feed</h4>
                    <FeedCard post={getPost(0)} />
                    <FeedCard post={getPost(1)} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Announcements & Event Tickets</h4>
                    <AnnouncementCard 
                      title="Creator Royalties Active" 
                      description="Verified NFT creators earn automated royalties on marketplace sales." 
                    />
                    <EventCard 
                      event={{
                        id: 'e1',
                        title: 'TonJam Listening Session',
                        organizer: 'TonJam',
                        date: 'UPCOMING',
                        location: 'Live Hub',
                        price: 'Free'
                      }} 
                    />
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Comments Feed</h4>
                    <CommentCard 
                      comment={{
                        id: 'c1',
                        authorName: getArtist(0).name,
                        authorAvatar: getArtist(0).avatarUrl,
                        isVerified: true,
                        content: 'Track comment preview.',
                        timeString: 'now',
                        likesCount: 0
                      }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TASKS SECTION */}
            {activeTab === 'tasks' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Streak & Daily Calendar</h4>
                    <StreakCard streakDays={0} multiplier="1.0x" />
                    <DailyRewardCard currentDay={1} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">XP Level Progress & Sharing</h4>
                    <XPCard currentXP={0} nextLevelXP={1000} level={1} />
                    <ReferralCard referralCode="TONJAM" rewardDetails="Share your referral link with friends." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest mb-3">Roster Missions</h4>
                    <div className="space-y-3">
                      <MissionCard mission={getMission(0)} />
                      <MissionCard mission={{ ...getMission(1), isCompleted: true, title: 'Connect Wallet' }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest mb-3">Mystery & Leaderboards</h4>
                    <div className="space-y-4">
                      <BonusRewardCard title="Scratchcard Claim" description="Claim your mystery promotional asset drop." rewardValue="25.0 GRAM Promo NFT" />
                      <ChallengeCard 
                        title="Vibe Creator Phonk Competition" 
                        description="Produce the highest streamed track in the Phonk category this month to capture the main prize pool!"
                        endsIn="3d 12h"
                        rewardPool="1,200 GRAM"
                        participantsCount={145}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Leaderboard Standings</h3>
                  <LeaderboardCard 
                    users={[
                      { id: 'l1', rank: 1, displayName: '@krupy', scoreText: '125,450 XP' },
                      { id: 'l2', rank: 2, displayName: '@Satoshi', scoreText: '98,120 XP' },
                      { id: 'l3', rank: 3, displayName: '@Zora_Web3', scoreText: '84,300 XP' },
                      { id: 'l4', rank: 4, displayName: 'GuestListener', scoreText: '72,100 XP' },
                    ]} 
                  />
                </div>
              </div>
            )}

            {/* WALLET SECTION */}
            {activeTab === 'wallet' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Connected Wallet Balance</h4>
                    <WalletBalanceCard address="EQB3120X91Z85Y_A72F6D1N_83W91X_Z92V" tonBalance="1,250.45" usdBalance="8,065.40" />
                    <RewardCard title="Gas-Back Royalty Accumulator" availableAmount="12.45 GRAM" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Portfolio Net Worth</h4>
                    <PortfolioCard 
                      netWorthUsd="8,520.40" 
                      change24h={4.5} 
                      tokens={[
                        { id: '1', name: 'Grams Network', symbol: 'GRAM', balance: '1,250.45', priceUsd: '6.45', change24h: 3.4 },
                        { id: '2', name: 'TonJam Native', symbol: 'JAM', balance: '4,500.00', priceUsd: '0.10', change24h: 12.5 },
                      ]} 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-emerald-400 uppercase mb-4">Held Token Assets</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    <TokenCard token={{ id: '1', name: 'Grams Network', symbol: 'GRAM', balance: '1,250.45', priceUsd: '6.45', change24h: 3.4 }} />
                    <TokenCard token={{ id: '2', name: 'TonJam Native', symbol: 'JAM', balance: '4,500.00', priceUsd: '0.10', change24h: 12.5 }} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-emerald-400 uppercase mb-4">Ledger Activity & Transactions</h3>
                  <div className="space-y-3">
                    <TransactionCard 
                      tx={{
                        id: 't1',
                        type: 'receive',
                        status: 'completed',
                        amount: '+45.0 GRAM',
                        usdAmount: '+$290.00',
                        address: 'EQA72X...92Z85Y',
                        timestamp: '5m ago',
                        txHash: '0x3a2f...'
                      }} 
                    />
                    <TransactionCard 
                      tx={{
                        id: 't2',
                        type: 'send',
                        status: 'pending',
                        amount: '-10.0 GRAM',
                        usdAmount: '-$64.50',
                        address: 'EQZ92V...3120X9',
                        timestamp: '15m ago',
                        txHash: '0x1b4e...'
                      }} 
                    />
                    <ActivityCard title="Minted NFT Exclusive Track" description="Synthesized Future Funk track series #201 on the blockchain ledger." timeString="1h ago" gasFeePaid="0.02" />
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS SECTION */}
            {activeTab === 'analytics' && (
              <div className="space-y-10">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                  <StreamsCard metric={{ label: 'Total Streams', value: '1.2M', changePercent: 12.4, timeRange: 'Last 30 days', chartData: [40, 55, 30, 75, 60, 85, 110] }} />
                  <RevenueCard metric={{ label: 'Total Earnings', value: '4,250 GRAM', changePercent: 8.2, timeRange: 'Last 30 days', chartData: [20, 45, 35, 60, 50, 75, 95] }} />
                  <FloorPriceAnalytics collectionName="Future Funk Series" currentFloor="14.5" change7d={12.4} volume24h="2,500" />
                  <MarketplaceVolume metric={{ label: 'Volume Chart', value: '42.5K', changePercent: 4.5, timeRange: '24h window' }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TopSellers 
                    sellers={[
                      { rank: 1, name: '@krupy', volume: '12,500' },
                      { rank: 2, name: '@Satoshi', volume: '8,450' },
                      { rank: 3, name: '@Zora_Web3', volume: '5,100' },
                    ]} 
                  />
                  <TopBuyers 
                    buyers={[
                      { rank: 1, name: '@Luna_Web3', volume: '6,200' },
                      { rank: 2, name: '@Vandal', volume: '4,100' },
                      { rank: 3, name: '@Nova_Pulse', volume: '3,800' },
                    ]} 
                  />
                  <TopCollections 
                    collections={[
                      { rank: 1, name: 'Genesis Synth Pack', volume: '34,500' },
                      { rank: 2, name: 'Phonk Legend Series', volume: '22,100' },
                      { rank: 3, name: 'Cyber Beats Edition', volume: '18,300' },
                    ]} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FollowersGrowth currentCount={124500} growthThisMonth={4500} />
                  <EngagementCard likesRate="65%" commentsRate="45%" sharesRate="22%" />
                  <ListeningAnalytics averageListeningTime="45m" peakGenre="Synthwave" />
                </div>
              </div>
            )}

            {/* HOME PAGE SECTION */}
            {activeTab === 'home' && (
              <div className="space-y-10">
                <HeroBanner 
                  title="Discover the Web3 Soundscape of TON" 
                  subtitle="Collect music NFTs, support creators directly, sync listen with friends on Telegram, and claim daily gas-back royalty promotions!" 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Sponsored Placement</h4>
                    <SponsoredFeedCard 
                      sponsorName="TON_Foundation" 
                      title="Sovereign Sounds Virtual Festival" 
                      description="Catch live stream broadcasts of verified artists competing in virtual audio space arenas. Mint tickets now." 
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#9AA0AE] uppercase tracking-widest">Quick Dashboard Actions</h4>
                    <TrendingBanner title="Future Funk Synthwave is Charting #1" tagline="Over 1.2M collective sync streams generated this week!" />
                    <QuickActionCard title="Liquidity Exchange" description="Trade your $JAM tokens for $TON instantly using our low fee automated DEX swaps." actionText="SWAP TOKENS" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-4">Discovery Channels</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    <DiscoverCard title="Interactive Web3 Radio Stations" iconType="radio" />
                    <DiscoverCard title="Exclusive NFT Track Collections" iconType="nft" />
                    <DiscoverCard title="Creator Curated Mix Playlists" iconType="playlists" />
                    <DiscoverCard title="Top Ranking Verified Stars" iconType="stars" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom status helper */}
      <div className="p-4 bg-[#0A113A]/90 backdrop-blur-md flex items-center justify-between sticky bottom-0 z-40 border-t border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-950 shrink-0">
            <img src={nowPlayingTrack.coverUrl} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] font-black uppercase text-blue-400 block">NOW STREAMING</span>
            <h4 className="text-xs font-bold text-white truncate leading-none">{nowPlayingTrack.title}</h4>
            <p className="text-[10px] text-[#9AA0AE] truncate mt-0.5 leading-none">{nowPlayingTrack.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-blue-600 rounded-full text-white active:scale-90 transition-transform">
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
export default UIKitShowcase;
