import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
 Info, 
 Camera, 
 Check, 
 Twitter, 
 Disc, 
 Instagram, 
 Globe, 
 Send, 
 CheckCircle, 
 Settings,
 LayoutDashboard, Edit, 
 Upload, 
 Plus, 
 ShieldCheck, 
 Play, 
 Heart, 
 Dna, 
 List, 
 Cpu, 
 ShieldAlert,
 Flame,
 Coins,
 Tag,
 Gavel,
 Trash2,
 Image as ImageIcon,
 ArrowLeft,
 Share2,
 Satellite,
 MapPin,
 Clock,
 MoreHorizontal,
 MessageCircle
} from 'lucide-react';

import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, MOCK_SONG_REQUESTS, TON_LOGO, TJ_COIN_ICON } from '@/constants';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, cn } from '@/lib/utils';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import { uploadFile } from '@/services/storageService';
import SocialFeed from '@/components/SocialFeed';
import VerifyArtistModal from '@/components/VerifyArtistModal';
import RoyaltyDashboard from '@/components/RoyaltyDashboard';
import EditArtistProfileModal from '@/components/EditArtistProfileModal';
import NFTMetadataManager from '@/components/NFTMetadataManager';
import SellNFTModal from '@/components/SellNFTModal';
import ManageNFTModal from '@/components/ManageNFTModal';
import { useAudio } from '@/context/AudioContext';
import ArtistTracksSection from '@/components/ArtistTracksSection';
import ArtistNFTsSection from '@/components/ArtistNFTsSection';
import ArtistActivitySection from '@/components/ArtistActivitySection';
import ArtistEvents from '@/components/ArtistEvents';
import { Artist, Track, Post, NFTItem, Event, Collaboration, SongRequest } from '@/types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import ArtistProfileHeader from '@/components/ArtistProfileHeader';
import ArtistVerification from '@/components/ArtistVerification';
import RequestSongModal from '@/components/RequestSongModal';
import SongRequestsTab from '@/components/SongRequestsTab';

const ArtistProfile: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { addNotification, playAll, playTrack, currentTrack, isPlaying, followedUserIds, toggleFollowUser, userProfile, artists, setArtists, updateNFT, allNFTs } = useAudio();
 const [activeTab, setActiveTab] = useState<'tracks' | 'collection' | 'signals' | 'about' | 'collaborations' | 'requests' | 'management'>('tracks');
 const isFollowing = useMemo(() => id ? followedUserIds.includes(id) : false, [id, followedUserIds]);
 const [customBanner, setCustomBanner] = useState<string | null>(null);
 const [showVerifyModal, setShowVerifyModal] = useState(false);
 const [showEditProfileModal, setShowEditProfileModal] = useState(false);
 const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
 const [isEditingBio, setIsEditingBio] = useState(false);
 const [editedBio, setEditedBio] = useState("");
 const fileInputRef = useRef<HTMLInputElement>(null);
 const [tonConnectUI] = useTonConnectUI();

 const [selectedTrackForMint, setSelectedTrackForMint] = useState<Track | null>(null);
 const [selectedNftForListing, setSelectedNftForListing] = useState<NFTItem | null>(null);
 const [selectedNftForManaging, setSelectedNftForManaging] = useState<NFTItem | null>(null);

 const handleNFTAction = (nft: NFTItem) => {
 if (nft.listingType) {
 setSelectedNftForManaging(nft);
 } else {
 setSelectedNftForListing(nft);
 }
 };

 // Metadata Management State
 const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
 const [metadata, setMetadata] = useState<Record<string, any>>({});
 const [isSavingMetadata, setIsSavingMetadata] = useState<string | null>(null);

 // Listing Management State
 const [editingListingId, setEditingListingId] = useState<string | null>(null);
 const [listingData, setListingData] = useState<Record<string, any>>({});
 const [isSavingListing, setIsSavingListing] = useState<string | null>(null);
 const [trackFilter, setTrackFilter] = useState<string>('All');

 const handleEditListing = (nft: NFTItem) => {
 setEditingListingId(nft.id);
 setListingData(prev => ({
 ...prev,
 [nft.id]: {
 price: nft.price || '1.0',
 listingType: nft.listingType || 'fixed',
 auctionEndTime: nft.auctionEndTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
 }
 }));
 };

 const handleListingChange = (nftId: string, field: string, value: any) => {
 setListingData(prev => ({
 ...prev,
 [nftId]: {
 ...prev[nftId],
 [field]: value
 }
 }));
 };

 const handleSaveListing = async (nftId: string) => {
 setIsSavingListing(nftId);
 const data = listingData[nftId];
 
 try {
 // Simulate API call with potential failure
 await new Promise((resolve, reject) => {
 setTimeout(() => {
 if (Math.random() < 0.1) { // 10% failure rate for simulation
 reject(new Error("Network congestion on TON blockchain. Please try again."));
 } else {
 resolve(true);
 }
 }, 1500);
 });
 
 updateNFT(nftId, {
 price: data.price,
 listingType: data.listingType,
 isAuction: data.listingType === 'auction',
 auctionEndTime: data.listingType === 'auction' ? new Date(data.auctionEndTime).toISOString() : undefined
 });

 addNotification(`Marketplace protocol for"${data.title || 'NFT'}"updated successfully.`,"success");
 setIsSavingListing(null);
 setEditingListingId(null);
 } catch (error: any) {
 console.error("Listing update failed:", error);
 addNotification(error.message ||"Failed to update marketplace protocol. Check your connection.","error");
 setIsSavingListing(null);
 }
 };

 const handleEditMetadata = (track: Track) => {
 setEditingTrackId(track.id);
 setMetadata(prev => ({
 ...prev,
 [track.id]: {
 title: track.title,
 genre: track.genre,
 price: track.price || '1.0',
 isNFT: track.isNFT || false,
 description: track.description || '',
 audioIpfsUrl: track.audioIpfsUrl || '',
 coverIpfsUrl: track.coverIpfsUrl || '',
 royaltySplits: track.royaltySplits || [{ address: artist?.walletAddress || '', percentage: 10, label: 'Artist' }]
 }
 }));
 };

 const handleAddRoyaltySplit = (trackId: string) => {
 setMetadata(prev => {
 const current = prev[trackId];
 return {
 ...prev,
 [trackId]: {
 ...current,
 royaltySplits: [...(current.royaltySplits || []), { address: '', percentage: 0, label: '' }]
 }
 };
 });
 };

 const handleRemoveRoyaltySplit = (trackId: string, index: number) => {
 setMetadata(prev => {
 const current = prev[trackId];
 const newSplits = [...(current.royaltySplits || [])];
 newSplits.splice(index, 1);
 return {
 ...prev,
 [trackId]: {
 ...current,
 royaltySplits: newSplits
 }
 };
 });
 };

 const handleRoyaltySplitChange = (trackId: string, index: number, field: string, value: any) => {
 setMetadata(prev => {
 const current = prev[trackId];
 const newSplits = [...(current.royaltySplits || [])];
 newSplits[index] = { ...newSplits[index], [field]: value };
 return {
 ...prev,
 [trackId]: {
 ...current,
 royaltySplits: newSplits
 }
 };
 });
 };

 const handleMetadataChange = (trackId: string, field: string, value: any) => {
 setMetadata(prev => ({
 ...prev,
 [trackId]: {
 ...prev[trackId],
 [field]: value
 }
 }));
 };

 const handleSaveMetadata = async (trackId: string) => {
 setIsSavingMetadata(trackId);
 try {
 await new Promise((resolve, reject) => {
 setTimeout(() => {
 if (Math.random() < 0.1) {
 reject(new Error("Metadata synchronization failed. Protocol timeout."));
 } else {
 resolve(true);
 }
 }, 1000);
 });
 
 const currentMetadata = metadata[trackId];
 handleSaveNFTMetadata(trackId, currentMetadata);
 
 setIsSavingMetadata(null);
 setEditingTrackId(null);
 } catch (error: any) {
 console.error("Metadata save failed:", error);
 addNotification(error.message ||"Failed to synchronize metadata. Please try again.","error");
 setIsSavingMetadata(null);
 }
 };

 const [isTippingArtist, setIsTippingArtist] = useState(false);

 const handleTipArtist = async (amount: number = 0.1) => {
 setIsTippingArtist(false);
 if (!tonConnectUI.connected) {
 tonConnectUI.openModal();
 return;
 }
 
 try {
 const transaction = {
 validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
 messages: [
 {
 address: artist?.walletAddress ||"EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c", // Fallback to a dummy address if artist has no wallet
 amount: (amount * 1000000000).toString(), // Convert TON to nanoton
 }
 ]
 };
 
 await tonConnectUI.sendTransaction(transaction);
 addNotification(`Successfully tipped ${artist?.name} ${amount} TON! Transaction broadcasted.`,"success");
 confetti({
 particleCount: 150,
 spread: 100,
 origin: { y: 0.8 },
 colors: ['#0088cc', '#ffffff', '#3b82f6'],
 ticks: 200,
 gravity: 1.5,
 scalar: 0.8,
 shapes: ['circle']
 });
 } catch (e: any) {
 console.error(e);
 if (e.message?.includes("User rejected")) {
 addNotification("Transaction rejected by user.","warning");
 } else {
 addNotification("Tipping transaction failed. Ensure you have sufficient TON balance.","error");
 }
 }
 };

 const isOwnProfile = useMemo(() => id === userProfile.uid, [id, userProfile.uid]);
 const artist = useMemo(() => artists.find(a => a.uid === id) || MOCK_ARTISTS.find(a => a.uid === id), [id, artists]);
 const artistTracks = useMemo(() => MOCK_TRACKS.filter(t => t.artistId === id), [id]);
 const artistNFTs = useMemo(() => {
 return allNFTs.filter(nft => nft.creator === artist?.name);
 }, [allNFTs, artist?.name]);

 const featuredNFT = useMemo(() => {
 return artistNFTs.find(nft => nft.listingType === 'auction') || artistNFTs[0];
 }, [artistNFTs]);

 const artistPosts = useMemo(() => MOCK_POSTS.filter(p => p.userName === artist?.name), [artist]);

 const trendingTracks = useMemo(() => {
 return [...artistTracks]
 .sort((a, b) => {
 const scoreA = (a.playCount || 0) + (a.likes || 0) * 5;
 const scoreB = (b.playCount || 0) + (b.likes || 0) * 5;
 return scoreB - scoreA;
 })
 .slice(0, 3);
 }, [artistTracks]);

 const topTracks = useMemo(() => {
 return [...artistTracks]
 .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
 .slice(0, 5);
 }, [artistTracks]);

 const marketStats = useMemo(() => {
 if (!artistNFTs.length) return null;
 const prices = artistNFTs.map(n => parseFloat(n.price));
 return {
 floor: Math.min(...prices).toFixed(1),
 volume: prices.reduce((a, b) => a + b, 0).toFixed(1),
 holders: Math.floor(artist ? artist.followers / 12 : 0)
 };
 }, [artistNFTs, artist]);

 useEffect(() => {
 window.scrollTo(0, 0);
 }, [id, artist]);

 const handleSaveBio = () => {
 if (!artist) return;
 setArtists(prev => prev.map(a => a.uid === artist.uid ? { ...a, bio: editedBio } : a));
 setIsEditingBio(false);
 addNotification("Biographical record synchronized.","success");
 };

 const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
  case 'x':
  case 'twitter':
  return Twitter;
  case 'instagram':
  return Instagram;
  case 'website':
  case 'link':
  return Globe;
  case 'telegram':
  return Send;
  case 'spotify':
  return Disc;
  default:
  return Globe;
  }
 };

 const SocialIcon = ({ icon: Icon, href, label }: { icon: any, href?: string, label: string }) => {
  if (!href) return null;
  return (
  <a 
  href={href.startsWith('http') ? href : `https://${href}`} 
  target="_blank" 
  rel="noopener noreferrer"
  className="p-2.5 bg-background shadow-lg shadow-black/20 rounded-xl text-muted-foreground hover:text-blue-500 hover:scale-110 active:scale-95 transition-all group"
  title={label}
  >
  <Icon className="w-4 h-4" />
  </a>
  );
 };

 const handleSaveNFTMetadata = (trackId: string, metadata: any) => {
 // In a real app, this would be an API call
 console.log(`Saving metadata for track ${trackId}:`, metadata);
 addNotification(`Metadata for"${metadata.title}"synchronized with Forge protocol.`,"success");
 };

 if (!artist) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
 <Disc className="h-12 w-12 text-muted-foreground/30 mb-4 animate-spin-slow"/>
 <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Artist Not Found</p>
 <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 font-bold text-[10px] uppercase tracking-widest">Return to Network</button>
 </div>
 );
 }

 const handleFollow = () => {
 if (id) {
 toggleFollowUser(id);
 const isNowFollowing = !followedUserIds.includes(id);
 addNotification(
 isNowFollowing 
 ? `Now following ${artist?.name}. Signals will appear in your feed.` 
 : `Unfollowed ${artist?.name}.`, 
"success"
 );
 }
 };

 const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const validation = validateFile(file, 'image', 5);
 if (!validation.isValid) {
 addNotification(validation.error ||"Invalid file","error");
 e.target.value = '';
 return;
 }
 
 try {
 addNotification("Adding banner image...","info");
 const storagePath = `profiles/${id}/banner.png`;
 const { downloadUrl } = await uploadFile(file, storagePath);
 setCustomBanner(downloadUrl);
 addNotification("Banner image added successfully","success");
 } catch (error: any) {
 console.error("Banner upload failed:", error);
 addNotification(`Banner upload failed: ${error.message}`,"error");
 }
 }
 };

 const StatBox = ({ label, value, sub, tooltip }: { label: string, value: string, sub?: string, tooltip?: string }) => (
 <div className="flex flex-col glass backdrop-blur-md bg-foreground/[0.02] p-5 rounded-[10px] transition-all group relative">
 <div className="flex items-center gap-4 mb-4">
 <span className="text-[7px] font-bold text-blue-400 uppercase tracking-[0.4em] group-hover:text-blue-300 transition-colors">{label}</span>
 {tooltip && (
 <div className="relative group/tooltip">
 <Info className="h-2 w-2 text-blue-400 hover:text-blue-300 cursor-help transition-colors"/>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 bg-background/90 backdrop-blur-xl rounded-[10px] text-[8px] text-foreground/70 normal-case tracking-normal font-medium opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-center pointer-events-none">
 {tooltip}
 <div className="absolute top-full left-1/2 -translate-x-1/2 -blue-500/30"></div>
 </div>
 </div>
 )}
 </div>
 <div className="flex items-baseline gap-4">
 <span className="text-xl font-bold text-blue-400 tracking-tighter leading-none group-hover:text-blue-300 transition-colors">{value}</span>
 {sub && <span className="text-[8px] font-bold text-blue-400/70 uppercase">{sub}</span>}
 </div>
 </div>
 );

 const themeClass = artist.profileTheme
 ? artist.profileTheme === 'dark' || artist.profileTheme === 'light' 
 ? artist.profileTheme 
 : `theme-${artist.profileTheme}`
 : '';

 const handleTip = async () => {
 if (!tonConnectUI.connected) {
 await tonConnectUI.openModal();
 return;
 }
 if (!artist.walletAddress) {
 addNotification("Artist does not have a wallet address set.","error");
 return;
 }
 const transaction = {
 messages: [
 {
 address: artist.walletAddress,
 amount: '1000000000', // 1 TON
 },
 ],
 validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
 };
 try {
 await tonConnectUI.sendTransaction(transaction);
 addNotification(`Tip sent successfully!`,"success");
 } catch (error) {
 console.error(error);
 addNotification(`Failed to send tip.`,"error");
 }
 };

 return (
 <>
 <div className={cn("animate-in fade-in duration-1000 pb-20 min-h-screen font-sans bg-background", themeClass)}>
 {/* 1. CINEMATIC BANNER */}
  
 <div className="relative h-[40vh] md:h-[50vh] overflow-hidden group">
 <div 
 className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
 style={{ backgroundImage: `url(${customBanner || artist.bannerUrl || getPlaceholderImage(`banner-${artist.uid}`, 1200, 400)})` }}
 />
  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
  
  {/* Extreme Left Actions ON Cover Picture */}
  {!isOwnProfile && artist && (
    <div className="absolute bottom-6 left-6 z-40 flex items-center gap-3">
      <button 
        onClick={handleFollow} 
        className={cn(
          "px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl backdrop-blur-md active:scale-95",
          isFollowing 
            ? "bg-white/10 text-white border border-white/20" 
            : "bg-blue-600 text-white shadow-blue-600/40"
        )}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      <button 
        onClick={() => {
          navigator.share?.({ title: artist.name, url: window.location.href })
            .catch(() => {
              navigator.clipboard.writeText(window.location.href);
              addNotification("Link copied", "success");
            });
        }}
        className="p-3 bg-white/10 text-white rounded-full hover:bg-blue-600 transition-all border border-white/10 backdrop-blur-md shadow-xl active:scale-90"
      >
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  )}
 
 {/* Banner Upload Trigger */}
 
 </div>
 
   <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-30">
    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pb-10">
      <div className="flex-1 w-full">
        <ArtistProfileHeader 
          artist={artist} 
          onTip={handleTip} 
          onEditProfile={() => setShowEditProfileModal(true)}
          isOwnProfile={isOwnProfile} 
        />
      </div>
    </div>
  </div>
  {/* Action Section (Moved to Banner) */}
  <div id="artist-profile-content-anchor" className="max-w-7xl mx-auto md:h-12 flex items-center group">
    {/* Anchor for tabs or other content */}
  </div>
  {isOwnProfile && (
    <>
      {!artist.verified && (
        <button onClick={() => setShowVerifyModal(true)} className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-500 transition-all shadow-sm flex items-center gap-2 mb-4 ml-4 md:ml-6">
          <ShieldCheck className="h-4 w-4" />
          Verify Artist
        </button>
      )}
    </>
  )}

  {/* 3. TABS NAVIGATION */}
 <div className="sticky top-[var(--header-height,64px)] z-40 bg-background/95 backdrop-blur-xl mb-8">
 <div className="max-w-7xl mx-auto px-4 md:px-6">
 <div className="flex items-center gap-10 overflow-x-auto no-scrollbar">
 {['tracks', 'collection', 'signals', 'about', 'collaborations', 'requests', ...(isOwnProfile ? ['management'] : [])].map(tab => (
 <button 
 key={tab} 
 onClick={() => setActiveTab(tab as any)} 
 className={cn(
"py-5 text-sm font-bold transition-all relative whitespace-nowrap uppercase tracking-widest",
 activeTab === tab ?"text-blue-500":"text-muted-foreground hover:text-foreground"
 )} 
 >
 {tab === 'signals' ? 'Feed' : tab === 'collection' ? 'NFTs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
 {activeTab === tab && (
 <motion.div 
 layoutId="activeTabArtist"
 className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"
 />
 )}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 md:px-6">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
 {/* Left Sidebar: Stats & Bio */}
 <div className="lg:col-span-4 space-y-10 order-2 lg:order-1">
 <section className="bg-muted/30 rounded-3xl p-8 backdrop-blur-sm">
 <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-8">Artist Stats</h3>
 <div className="grid grid-cols-2 gap-8">
 <div className="space-y-1">
 <p className="text-2xl font-black text-foreground tabular-nums">{(artist.playCount || 0).toLocaleString()}</p>
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Plays</p>
 </div>
 <div className="space-y-1">
 <p className="text-2xl font-black text-foreground tabular-nums">{(artist.monthlyListeners || 0).toLocaleString()}</p>
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Monthly</p>
 </div>
 <div className="space-y-1">
 <p className="text-2xl font-black text-foreground tabular-nums">{artist.followers.toLocaleString()}</p>
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Followers</p>
 </div>
 <div className="space-y-1">
 <p className="text-2xl font-black text-foreground tabular-nums">{artistNFTs.length}</p>
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">NFTs</p>
 </div>
 </div>
 </section>

 <section className="bg-muted/30 rounded-3xl p-8 backdrop-blur-sm">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Biography</h3>
 {isOwnProfile && (
 <button 
 onClick={() => setIsEditingBio(!isEditingBio)}
 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
 >
 {isEditingBio ? 'Cancel' : 'Edit'}
 </button>
 )}
 </div>
 
 {isEditingBio ? (
 <div className="space-y-4">
 <textarea
 value={editedBio}
 onChange={(e) => setEditedBio(e.target.value)}
 className="w-full bg-background/50 rounded-2xl p-4 text-sm text-foreground focus:ring-2 focus:ring-blue-500/20 focus:-blue-500 outline-none transition-all min-h-[150px] resize-none"
 placeholder="Tell your story..."
 />
 <button 
 onClick={handleSaveBio}
 className="w-full py-3 bg-blue-500 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
 >
 Save Biography
 </button>
 </div>
 ) : (
 <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
 {artist.bio ||"No biography provided yet."}
 </p>
 )}
 </section>
 </div>

 {/* Right Content: Tabs Content */}
 <div className="lg:col-span-8 order-1 lg:order-2 min-h-[600px]">
 {activeTab === 'tracks' && (
 <div className="space-y-12">
 {/* Popular Tracks */}
 <section>
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-xl font-black text-foreground tracking-tight">Popular Releases</h3>
 <button onClick={() => playAll(artistTracks)} className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
 <Play className="h-4 w-4 fill-current"/> Play All
 </button>
 </div>
 <div className="grid grid-cols-1 gap-4">
 {artistTracks.slice(0, 5).map((track, idx) => (
 <div key={track.id} className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-muted/50 transition-all hover:/50">
 <span className="text-xs font-black text-muted-foreground/50 w-4">{idx + 1}</span>
 <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md">
 <img src={track.coverUrl} className="w-full h-full object-cover"alt=""/>
 <button 
 onClick={() => playTrack(track)}
 className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <Play className="h-6 w-6 text-white fill-current"/>
 </button>
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-bold text-foreground truncate">{track.title}</h4>
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{track.genre}</p>
 </div>
 <div className="hidden md:flex items-center gap-8 text-xs font-bold text-muted-foreground tabular-nums">
 <span>{(track.playCount || 0).toLocaleString()}</span>
 <span>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
 </div>
 <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
 <MoreHorizontal className="h-5 w-5"/>
 </button>
 </div>
 ))}
 </div>
 </section>

 {/* Top Tracks by Play Count */}
 <section>
 <h3 className="text-xl font-black text-foreground tracking-tight mb-8">Top Tracks</h3>
 <div className="grid grid-cols-1 gap-4">
 {topTracks.map((track, idx) => (
 <div key={track.id} className="group flex items-center gap-6 p-4 rounded-2xl bg-muted/20 /50">
 <span className="text-xs font-black text-blue-500 w-4">{idx + 1}</span>
 <div className="relative w-12 h-12 rounded-lg overflow-hidden">
 <img src={track.coverUrl} className="w-full h-full object-cover"alt=""/>
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-bold text-foreground truncate">{track.title}</h4>
 </div>
 <div className="text-xs font-bold text-muted-foreground tabular-nums">
 {(track.playCount || 0).toLocaleString()} plays
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* All Tracks */}
 <section>
 <h3 className="text-xl font-black text-foreground tracking-tight mb-8">All Tracks</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
 {artistTracks.map(track => (
 <TrackCard key={track.id} track={track} />
 ))}
 </div>
 </section>
 </div>
 )}

 {activeTab === 'collection' && (
 <div className="space-y-8">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-xl font-black text-foreground tracking-tight">Digital Collectibles</h3>
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{artistNFTs.length} Items</p>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
 {artistNFTs.map(nft => (
 <NFTCard key={nft.id} nft={nft} />
 ))}
 </div>
 </div>
 )}

 {activeTab === 'signals' && (
 <div className="max-w-2xl mx-auto space-y-8">
 <h3 className="text-xl font-black text-foreground tracking-tight mb-8">Artist Feed</h3>
 {artistPosts.map(post => (
 <div key={post.id} className="bg-muted/30 rounded-3xl p-8 /50 backdrop-blur-sm space-y-6">
 <div className="flex items-center gap-4">
 <img src={artist.avatarUrl} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"alt=""/>
 <div>
 <h4 className="text-sm font-bold text-foreground">{artist.name}</h4>
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{post.timestamp}</p>
 </div>
 </div>
 <p className="text-sm leading-relaxed text-foreground/90">{post.content}</p>
 {post.imageUrl && (
 <div className="rounded-2xl overflow-hidden shadow-lg">
 <img src={post.imageUrl} className="w-full h-auto"alt=""/>
 </div>
 )}
 <div className="flex items-center gap-8 pt-4 /50">
 <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-blue-500 transition-colors">
 <Heart className="h-4 w-4"/> {post.likes}
 </button>
 <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-blue-500 transition-colors">
 <MessageCircle className="h-4 w-4"/> {post.comments}
 </button>
 <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-blue-500 transition-colors">
 <Share2 className="h-4 w-4"/> Share
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {activeTab === 'about' && (
 <div className="space-y-12">
 <section>
 <h3 className="text-xl font-black text-foreground tracking-tight mb-8">About {artist.name}</h3>
 <div className="bg-muted/30 rounded-3xl p-10 /50 backdrop-blur-sm">
 <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap mb-10">
 {artist.bio ||"No biography provided yet."}
 </p>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-10 /50">
 <div className="space-y-1">
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Location</p>
 <p className="text-sm font-bold text-foreground">{artist.location || 'Global'}</p>
 </div>
 <div className="space-y-1">
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Joined</p>
 <p className="text-sm font-bold text-foreground">March 2024</p>
 </div>
 <div className="space-y-1">
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Genre</p>
 <p className="text-sm font-bold text-foreground">{artist.genre || 'Electronic'}</p>
 </div>
 <div className="space-y-1">
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verified</p>
 <p className="text-sm font-bold text-blue-500">Yes</p>
 </div>
 </div>
 </div>
 </section>

 {/* Network Stats */}
 <section className="glass bg-foreground/[0.01] p-6 rounded-[12px]">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
 <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">Network Stats</h2>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 { label: 'Genre', value: artist.genre },
 { label: 'Joined', value: 'OCT 2023' },
 { label: 'Location', value: 'Digital Frontier' },
 { label: 'Status', value: 'Online' }
 ].map(stat => (
 <div key={`stat-${stat.label}`} className="p-4 bg-muted/30 rounded-[8px]">
 <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</div>
 <div className="text-sm font-bold text-foreground">{stat.value}</div>
 </div>
 ))}
 </div>
 </section>

 {/* Events */}
 {artist.events && artist.events.length > 0 && (
 <section>
 <div className="flex items-center gap-4 mb-4">
 <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
 <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">Upcoming Events</h2>
 </div>
 <div className="space-y-4">
 {artist.events.map(event => (
 <div key={event.id} className="p-4 rounded-[10px] bg-muted/50 flex justify-between items-center">
 <div>
 <h4 className="text-sm font-bold text-foreground">{event.title}</h4>
 <p className="text-[10px] text-muted-foreground">{event.date} @ {event.time} • {event.venue}</p>
 </div>
 {event.ticketUrl && (
 <a href={event.ticketUrl} target="_blank"rel="noopener noreferrer"className="px-4 py-2 bg-blue-600 text-white rounded-[6px] text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all">Tickets</a>
 )}
 </div>
 ))}
 </div>
 </section>
 )}
 </div>
 )}

 {activeTab === 'collaborations' && (
 <section className="glass bg-foreground/[0.01] p-6 rounded-[12px] animate-in fade-in duration-700">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-1 h-6 bg-pink-500 rounded-full"></div>
 <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">Collaborations</h2>
 </div>
 {artist.collaborations && artist.collaborations.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {artist.collaborations.map(collab => (
 <div key={collab.id} className="p-4 rounded-[10px] bg-muted/50 flex items-center gap-4">
 <img src={collab.coverUrl} alt={collab.trackTitle} className="w-12 h-12 rounded-[6px] object-cover"/>
 <div className="min-w-0">
 <h4 className="text-sm font-bold text-foreground truncate">{collab.trackTitle}</h4>
 <p className="text-xs text-muted-foreground">w/ {collab.artistName}</p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No collaborations found.</p>
 )}
 </section>
 )}

 {activeTab === 'requests' && (
 <section className="animate-in fade-in duration-700">
 <SongRequestsTab artistId={artist.uid} isOwnProfile={isOwnProfile} />
 </section>
 )}


 {activeTab === 'management' && isOwnProfile && (
 <div className="space-y-4 animate-in fade-in duration-700">
 <RoyaltyDashboard artist={artist} />
 
 {/* Manage Metadata Section */}
 <div className="space-y-4">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-10 h-10 bg-purple-600/20 rounded-[10px] flex items-center justify-center">
 <Disc className="h-4 w-4 text-purple-400"/>
 </div>
 <div>
 <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">Manage Metadata</h3>
 <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Configure tracks for NFT minting protocols</p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4">
 {artistTracks.map((track) => {
 const isEditing = editingTrackId === track.id;
 const currentMetadata = metadata[track.id] || {
 title: track.title,
 genre: track.genre,
 price: track.price || '1.0',
 isNFT: track.isNFT || false
 };

 return (
 <div 
 key={track.id}
 className={`glass transition-all duration-300 rounded-[12px] overflow-hidden ${
 isEditing ? ' bg-neutral-500/5' : ' bg-foreground/[0.01] hover:bg-foreground/[0.03]'
 }`}
 >
 <div className="p-4">
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-4 flex-1 min-w-0">
 <img src={track.coverUrl} className="w-12 h-12 rounded-[8px] object-cover shadow-lg"alt=""/>
 <div className="min-w-0">
 <h4 className="text-sm font-bold text-foreground dark:text-white truncate uppercase tracking-tight">{track.title}</h4>
 <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{track.genre} • {track.isNFT ? 'NFT Protocol Active' : 'Standard Stream'}</p>
 </div>
 </div>

 <div className="flex items-center gap-4">
 {!isEditing ? (
 <button 
 onClick={() => handleEditMetadata(track)}
 className="px-4 py-4 bg-muted/50 hover:bg-muted text-muted-foreground/80 hover:text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
 >
 Configure Metadata
 </button>
 ) : (
 <div className="flex items-center gap-4">
 <button 
 onClick={() => setEditingTrackId(null)}
 className="px-4 py-4 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
 >
 Cancel
 </button>
 <button 
 onClick={() => handleSaveMetadata(track.id)}
 disabled={isSavingMetadata === track.id}
 className="px-4 py-4 bg-purple-600 hover:bg-purple-500 text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 flex items-center gap-4"
 >
 {isSavingMetadata === track.id ? (
 <div className="w-3 h-3 -2 -white rounded-full animate-spin"/>
 ) : (
 <Check className="w-3 h-3"/>
 )}
 Save Changes
 </button>
 </div>
 )}
 </div>
 </div>

 {isEditing && (
 <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
 <div className="space-y-4">
 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 Track Title
 </label>
 <input 
 type="text"
 value={currentMetadata.title}
 onChange={(e) => handleMetadataChange(track.id, 'title', e.target.value)}
 className="w-full bg-background/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus: transition-all"
 />
 </div>

 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 Genre
 </label>
 <select 
 value={currentMetadata.genre}
 onChange={(e) => handleMetadataChange(track.id, 'genre', e.target.value)}
 className="w-full bg-background/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus: transition-all appearance-none"
 >
 {['Techno', 'House', 'Ambient', 'Phonk', 'Cyberpunk', 'Lo-Fi', 'Electronic', 'Pop'].map(g => (
 <option key={g} value={g}>{g}</option>
 ))}
 </select>
 </div>

 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 Description
 </label>
 <textarea 
 value={currentMetadata.description}
 onChange={(e) => handleMetadataChange(track.id, 'description', e.target.value)}
 rows={3}
 placeholder="Describe the sonic journey..."
 className="w-full bg-background/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus: transition-all resize-none"
 />
 </div>
 </div>

 <div className="space-y-4">
 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 IPFS Audio URL
 </label>
 <input 
 type="text"
 value={currentMetadata.audioIpfsUrl}
 onChange={(e) => handleMetadataChange(track.id, 'audioIpfsUrl', e.target.value)}
 placeholder="ipfs://..."
 className="w-full bg-background/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus: transition-all"
 />
 </div>

 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 IPFS Cover URL
 </label>
 <input 
 type="text"
 value={currentMetadata.coverIpfsUrl}
 onChange={(e) => handleMetadataChange(track.id, 'coverIpfsUrl', e.target.value)}
 placeholder="ipfs://..."
 className="w-full bg-background/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus: transition-all"
 />
 </div>

 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 NFT Price (TON)
 </label>
 <input 
 type="number"
 step="0.1"
 value={currentMetadata.price}
 onChange={(e) => handleMetadataChange(track.id, 'price', e.target.value)}
 className="w-full bg-background/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus: transition-all"
 />
 </div>

 <div className="p-4 bg-neutral-600/5 rounded-[10px] flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
 <Disc className="w-4 h-4 text-purple-400"/>
 </div>
 <div>
 <h5 className="text-[10px] font-bold text-foreground uppercase tracking-tight">NFT Option</h5>
 <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Enable NFT minting for this track</p>
 </div>
 </div>
 <button 
 onClick={() => handleMetadataChange(track.id, 'isNFT', !currentMetadata.isNFT)}
 className={`w-12 h-6 rounded-full transition-colors relative ${currentMetadata.isNFT ? 'bg-purple-500' : 'bg-muted'}`}
 >
 <div className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-all ${currentMetadata.isNFT ? 'left-7' : 'left-1'}`} />
 </button>
 </div>
 </div>

 {/* Royalty Splits Section */}
 <div className="md:col-span-2 space-y-4 pt-4">
 <div className="flex items-center justify-between">
 <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 Royalty Splits (%)
 </label>
 <button 
 onClick={() => handleAddRoyaltySplit(track.id)}
 className="flex items-center gap-4 text-[8px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors"
 >
 <Plus className="w-3 h-3"/> Add Recipient
 </button>
 </div>
 
 <div className="space-y-4">
 {currentMetadata.royaltySplits?.map((split: any, index: number) => (
 <div key={`split-${index}`} className="grid grid-cols-12 gap-4 items-center">
 <div className="col-span-5">
 <input 
 type="text"
 placeholder="Wallet Address"
 value={split.address}
 onChange={(e) => handleRoyaltySplitChange(track.id, index, 'address', e.target.value)}
 className="w-full bg-background/40 rounded-[8px] p-4 text-[10px] text-foreground outline-none focus: transition-all"
 />
 </div>
 <div className="col-span-3">
 <input 
 type="text"
 placeholder="Label (e.g. Producer)"
 value={split.label}
 onChange={(e) => handleRoyaltySplitChange(track.id, index, 'label', e.target.value)}
 className="w-full bg-background/40 rounded-[8px] p-4 text-[10px] text-foreground outline-none focus: transition-all"
 />
 </div>
 <div className="col-span-3 relative">
 <input 
 type="number"
 placeholder="%"
 value={split.percentage}
 onChange={(e) => handleRoyaltySplitChange(track.id, index, 'percentage', parseFloat(e.target.value))}
 className="w-full bg-background/40 rounded-[8px] p-4 pr-4 text-[10px] text-foreground outline-none focus: transition-all"
 />
 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50">%</span>
 </div>
 <div className="col-span-1 flex justify-end">
 <button 
 onClick={() => handleRemoveRoyaltySplit(track.id, index)}
 className="p-4 text-muted-foreground/50 hover:text-red-400 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5"/>
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Profile Customization Section */}
 <div className="space-y-4">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-10 h-10 bg-pink-500/20 rounded-[10px] flex items-center justify-center">
 <ImageIcon className="h-4 w-4 text-pink-500"/>
 </div>
 <div>
 <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">Profile Customization</h3>
 <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Update your visual identity on the network</p>
 </div>
 </div>

 <div className="glass bg-foreground/[0.01] rounded-[12px] p-5">
 <div className="space-y-4">
 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 Profile Banner
 </label>
 <div className="relative w-full h-48 rounded-[10px] overflow-hidden group bg-muted/50">
 <div 
 className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity"
 style={{ backgroundImage: `url(${customBanner || artist.bannerUrl || getPlaceholderImage(`banner-${artist.uid}`, 1200, 400)})` }}
 />
 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 <button 
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="px-4 py-4 bg-muted backdrop-blur-md rounded-[8px] text-[9px] font-bold text-foreground uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center gap-4"
 >
 <Upload className="h-3 w-3"/> Upload New Banner
 </button>
 </div>
 </div>
 <p className="text-[8px] text-foreground/30">Recommended size: 1500x500px. Max 5MB.</p>
 </div>
 </div>
 </div>
 </div>

 {/* Marketplace Management Section */}
 <div className="space-y-4">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-10 h-10 bg-amber-500/20 rounded-[10px] flex items-center justify-center">
 <Tag className="h-4 w-4 text-amber-500"/>
 </div>
 <div>
 <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">Marketplace Management</h3>
 <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Configure sale and auction protocols for your collection</p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4">
 {artistNFTs.map((nft) => {
 const isEditing = editingListingId === nft.id;
 const currentListing = listingData[nft.id] || {
 price: nft.price || '1.0',
 listingType: nft.listingType || 'fixed',
 auctionEndTime: nft.auctionEndTime ? new Date(nft.auctionEndTime).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
 };

 return (
 <div 
 key={nft.id}
 className={`glass transition-all duration-300 rounded-[12px] overflow-hidden ${
 isEditing ? ' bg-amber-500/5' : ' bg-foreground/[0.01] hover:bg-foreground/[0.03]'
 }`}
 >
 <div className="p-4">
 <div className="flex items-center justify-between gap-4">
 <div 
 className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group/item"
 onClick={() => navigate(`/nft/${nft.id}`)}
 >
 <img src={nft.imageUrl} className="w-12 h-12 rounded-[8px] object-cover shadow-lg group-hover/item:scale-105 transition-transform"alt=""/>
 <div className="min-w-0">
 <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight group-hover/item:text-amber-400 transition-colors">{nft.title}</h4>
 <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
 {nft.listingType === 'auction' ? 'Active Auction' : nft.listingType === 'fixed' ? 'Fixed Price' : 'Not Listed'} • {nft.price} TON
 </p>
 </div>
 </div>

 <div className="flex items-center gap-4">
 {!isEditing ? (
 <button 
 onClick={() => handleEditListing(nft)}
 className="px-4 py-4 bg-muted/50 hover:bg-muted text-muted-foreground/80 hover:text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
 >
 Manage Listing
 </button>
 ) : (
 <div className="flex items-center gap-4">
 <button 
 onClick={() => setEditingListingId(null)}
 className="px-4 py-4 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
 >
 Cancel
 </button>
 <button 
 onClick={() => handleSaveListing(nft.id)}
 disabled={isSavingListing === nft.id}
 className="px-4 py-4 bg-amber-500 hover:bg-amber-400 text-background rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center gap-4"
 >
 {isSavingListing === nft.id ? (
 <div className="w-3 h-3 -2 -black rounded-full animate-spin"/>
 ) : (
 <Check className="w-3 h-3"/>
 )}
 Update Listing
 </button>
 </div>
 )}
 </div>
 </div>

 {isEditing && (
 <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
 <div className="space-y-4">
 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 Listing Type
 </label>
 <div className="flex gap-4">
 <button 
 onClick={() => handleListingChange(nft.id, 'listingType', 'fixed')}
 className={`flex-1 py-4 rounded-[8px] text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${currentListing.listingType === 'fixed' ? 'bg-neutral-600/10 text-neutral-500' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
 >
 <Tag className="w-3 h-3"/> Fixed Price
 </button>
 <button 
 onClick={() => handleListingChange(nft.id, 'listingType', 'auction')}
 className={`flex-1 py-4 rounded-[8px] text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${currentListing.listingType === 'auction' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
 >
 <Gavel className="w-3 h-3"/> Auction
 </button>
 </div>
 </div>

 <div className="space-y-4">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 {currentListing.listingType === 'auction' ? 'Starting Bid (TON)' : 'Sale Price (TON)'}
 </label>
 <div className="relative">
 <img src={TON_LOGO} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"alt=""/>
 <input 
 type="number"
 step="0.1"
 value={currentListing.price}
 onChange={(e) => handleListingChange(nft.id, 'price', e.target.value)}
 className="w-full bg-background/40 rounded-[8px] py-4 pl-4 pr-4 text-xs text-foreground outline-none focus: transition-all"
 />
 </div>
 </div>
 </div>

 <div className="space-y-4">
 {currentListing.listingType === 'auction' && (
 <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
 <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
 Auction End Date
 </label>
 <input 
 type="date"
 value={currentListing.auctionEndTime}
 onChange={(e) => handleListingChange(nft.id, 'auctionEndTime', e.target.value)}
 className="w-full bg-background/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus: transition-all"
 />
 <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-4">Protocol will finalize at 00:00 UTC on selected date</p>
 </div>
 )}

 <div className="p-4 bg-amber-500/5 rounded-[10px] flex gap-4">
 <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-4"/>
 <p className="text-[9px] text-muted-foreground/80 leading-relaxed uppercase tracking-widest">
 Listing this asset will make it visible in the global marketplace. A 2.5% protocol fee applies to all successful transfers.
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
 })}
 {artistNFTs.length === 0 && (
 <div className="py-4 text-center bg-muted/50 rounded-[12px]">
 <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">No minted protocols available for listing.</p>
 </div>
 )}
 </div>
 </div>

 {artist.events && artist.events.length > 0 && (
 <section className="bg-card rounded-[10px] p-4">
 <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter mb-4">Upcoming Events</h3>
 <div className="space-y-4">
 {artist.events.map(event => (
 <div key={event.id} className="flex justify-between items-center p-4 rounded-[10px] bg-muted/50">
 <div>
 <h4 className="text-sm font-bold text-foreground">{event.title}</h4>
 <p className="text-[10px] text-muted-foreground">{event.date} @ {event.time} • {event.venue}, {event.location}</p>
 </div>
 {event.ticketUrl && (
 <a href={event.ticketUrl} target="_blank"rel="noopener noreferrer"className="px-4 py-4 bg-blue-600 text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all">Tickets</a>
 )}
 </div>
 ))}
 </div>
 </section>
 )}

 {artist.collaborations && artist.collaborations.length > 0 && (
 <section className="bg-card rounded-[10px] p-4">
 <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter mb-4">Featured Collaborations</h3>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {artist.collaborations.map(collab => (
 <div key={collab.id} className="p-4 rounded-[10px] bg-muted/50 flex flex-col items-center text-center">
 <img src={collab.coverUrl} alt={collab.trackTitle} className="w-16 h-16 rounded-[8px] mb-4 object-cover"/>
 <h4 className="text-xs font-bold text-foreground">{collab.trackTitle}</h4>
 <p className="text-[10px] text-muted-foreground">with {collab.artistName}</p>
 </div>
 ))}
 </div>
 </section>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 <div className="h-32"></div>
 {showVerifyModal && artist && <VerifyArtistModal onClose={() => setShowVerifyModal(false)} artistName={artist.name} />}
 {showEditProfileModal && <EditArtistProfileModal artist={artist} onClose={() => setShowEditProfileModal(false)} />}
 
 {selectedNftForListing && (
 <SellNFTModal 
 nft={selectedNftForListing} 
 onClose={() => setSelectedNftForListing(null)} 
 />
 )}
 {selectedNftForManaging && (
 <ManageNFTModal 
 nft={selectedNftForManaging} 
 isOpen={true}
 onClose={() => setSelectedNftForManaging(null)} 
 />
 )}
 </>
 );
};

export default ArtistProfile;
