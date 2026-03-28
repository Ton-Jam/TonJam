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
  Edit, 
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
  Clock
} from 'lucide-react';

import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, MOCK_SONG_REQUESTS, TON_LOGO, TJ_COIN_ICON } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import { uploadToIPFS } from '@/services/pinataService';
import SocialFeed from '@/components/SocialFeed';
import VerifyArtistModal from '@/components/VerifyArtistModal';
import RoyaltyDashboard from '@/components/RoyaltyDashboard';
import EditArtistProfileModal from '@/components/EditArtistProfileModal';
import NFTMetadataManager from '@/components/NFTMetadataManager';
import SellNFTModal from '@/components/SellNFTModal';
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

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, playAll, currentTrack, isPlaying, followedUserIds, toggleFollowUser, userProfile, artists, setArtists, updateNFT, allNFTs } = useAudio();
  const [activeTab, setActiveTab] = useState<'tracks' | 'collection' | 'signals' | 'about' | 'requests' | 'management'>('tracks');
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

      addNotification(`Marketplace protocol for "${data.title || 'NFT'}" updated successfully.`, "success");
      setIsSavingListing(null);
      setEditingListingId(null);
    } catch (error: any) {
      console.error("Listing update failed:", error);
      addNotification(error.message || "Failed to update marketplace protocol. Check your connection.", "error");
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
      addNotification(error.message || "Failed to synchronize metadata. Please try again.", "error");
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
            address: artist?.walletAddress || "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c", // Fallback to a dummy address if artist has no wallet
            amount: (amount * 1000000000).toString(), // Convert TON to nanoton
          }
        ]
      };
      
      await tonConnectUI.sendTransaction(transaction);
      addNotification(`Successfully tipped ${artist?.name} ${amount} TON! Transaction broadcasted.`, "success");
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
        addNotification("Transaction rejected by user.", "warning");
      } else {
        addNotification("Tipping transaction failed. Ensure you have sufficient TON balance.", "error");
      }
    }
  };

  const isOwnProfile = useMemo(() => id === userProfile.id, [id, userProfile.id]);
  const artist = useMemo(() => artists.find(a => a.id === id) || MOCK_ARTISTS.find(a => a.id === id), [id, artists]);
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
    setArtists(prev => prev.map(a => a.id === artist.id ? { ...a, bio: editedBio } : a));
    setIsEditingBio(false);
    addNotification("Biographical record synchronized.", "success");
  };

  const handleSaveNFTMetadata = (trackId: string, metadata: any) => {
    // In a real app, this would be an API call
    console.log(`Saving metadata for track ${trackId}:`, metadata);
    addNotification(`Metadata for "${metadata.title}" synchronized with Forge protocol.`, "success");
  };

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Disc className="h-12 w-12 text-muted-foreground/30 mb-4 animate-spin-slow" />
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
      if (!file.type.startsWith('image/')) {
        addNotification("Unsupported file format. Please upload a valid image file (e.g., JPG, PNG).", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addNotification("File is too large. Please upload an image smaller than 5MB.", "error");
        return;
      }
      
      try {
        addNotification("Uploading banner to IPFS...", "info");
        const { ipfsUrl } = await uploadToIPFS(file);
        setCustomBanner(ipfsUrl);
        addNotification("Banner protocol updated successfully on IPFS.", "success");
      } catch (error: any) {
        console.error("Banner upload failed:", error);
        addNotification(`Banner upload failed: ${error.message}`, "error");
      }
    }
  };

  const StatBox = ({ label, value, sub, tooltip }: { label: string, value: string, sub?: string, tooltip?: string }) => (
    <div className="flex flex-col glass border border-blue-500/30 backdrop-blur-md bg-foreground/[0.02] p-5 rounded-[10px] transition-all group relative">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-[7px] font-bold text-blue-400 uppercase tracking-[0.4em] group-hover:text-blue-300 transition-colors">{label}</span>
        {tooltip && (
          <div className="relative group/tooltip">
            <Info className="h-2 w-2 text-blue-400 hover:text-blue-300 cursor-help transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 bg-background/90 backdrop-blur-xl rounded-[10px] text-[8px] text-foreground/70 normal-case tracking-normal font-medium opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-center pointer-events-none">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-transparent border-t-blue-500/30"></div>
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

  return (
    <div className="animate-in fade-in duration-1000 pb-4 min-h-screen font-sans">
      {/* 1. COMPACT CINEMATIC BANNER */}
      <div className="relative h-[30vh] md:h-[35vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${customBanner || artist.bannerUrl || getPlaceholderImage(`banner-${artist.id}`, 1200, 400)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        {/* Banner Upload Trigger */}
        {isOwnProfile && (
          <div className="absolute top-6 right-6 z-40">
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-background/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-foreground hover:bg-background/80 transition-all flex items-center gap-2" >
              <Camera className="h-4 w-4" /> Edit Cover
            </button>
            <input type="file" ref={fileInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
          </div>
        )}
      </div>

      {/* 2. INTEGRATED IDENTITY & ACTION HUB */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 pb-8">
          <ArtistProfileHeader artist={artist} />
          
          <div className="flex items-center gap-3">
            {isOwnProfile && (
              <button onClick={() => setShowEditProfileModal(true)} className="px-6 py-2 bg-muted text-foreground rounded-full font-bold text-xs uppercase tracking-widest hover:bg-muted/80 transition-all" >
                Edit Profile
              </button>
            )}
            <button onClick={() => playAll(artistTracks)} className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2" >
              <Play className="h-4 w-4 fill-current" /> Play
            </button>
            {!isOwnProfile && (
              <button onClick={() => setActiveTab('requests')} className="px-4 py-1.5 bg-purple-600 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center gap-2" >
                Request Song
              </button>
            )}
            <button 
              onClick={handleFollow} 
              className={`px-6 py-2 rounded-full flex items-center justify-center gap-2 transition-all text-xs font-bold uppercase tracking-widest
                ${isFollowing 
                  ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

              {/* Trending Tracks Relay */}
      {trendingTracks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <h2 className="text-xl font-bold text-foreground mb-4">Trending</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
            {trendingTracks.map((track, idx) => (
              <div key={`trending-${track.id}`} className="min-w-[280px] sm:min-w-[320px] group relative" >
                <div className="p-4 rounded-[10px] transition-all bg-card flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-[10px] overflow-hidden shadow-lg">
                    <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    <button onClick={() => playAll([track])} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" >
                      <Play className="text-white h-6 w-6 fill-white" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate leading-tight mb-1">{track.title}</h3>
                    <p className="text-xs text-muted-foreground">{(track.playCount || 0).toLocaleString()} streams</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Tracks Section */}
      {topTracks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Popular</h2>
          <div className="space-y-2">
            {topTracks.map((track, idx) => (
              <div 
                key={`top-${track.id}`} 
                className="group flex items-center gap-4 p-2 rounded-[8px] hover:bg-muted/50 transition-all cursor-pointer"
                onClick={() => playAll([track])}
              >
                <span className="w-8 text-sm font-medium text-muted-foreground text-center">{idx + 1}</span>
                <div className="relative w-12 h-12 rounded-[4px] overflow-hidden flex-shrink-0">
                  <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate">{track.title}</h4>
                </div>
                <div className="text-sm text-muted-foreground">
                  {(track.playCount || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground w-16 text-right">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Tab Navigation */}
      <div className="sticky top-[var(--header-height,64px)] z-30 bg-background/95 backdrop-blur-xl py-4 mt-4 mb-4 w-full px-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-8 overflow-x-auto no-scrollbar">
          {['tracks', 'collection', 'signals', 'about', ...(isOwnProfile ? ['management'] : [])].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)} 
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} 
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary rounded-full"></div>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left: Intelligence Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Biography */}
            <section className="p-5 bg-card rounded-[10px] group/bio">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Origin Narrative</h3>
                {isOwnProfile && !isEditingBio && (
                  <button 
                    onClick={() => {
                      setIsEditingBio(true);
                      setEditedBio(artist.bio || "");
                    }}
                    className="text-[8px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingBio ? (
                <div className="space-y-4">
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full bg-muted/50 border border-blue-500/40 rounded-[10px] p-5 text-xs text-muted-foreground/90 leading-relaxed outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none"
                    placeholder="Enter artist biography..."
                  />
                  <div className="flex gap-4 justify-end">
                    <button 
                      onClick={() => setIsEditingBio(false)}
                      className="px-4 py-4 bg-muted/50 text-muted-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveBio}
                      className="px-4 py-4 bg-blue-600 text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                    >
                      Save Protocol
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">{artist.bio || "No biographical record in neural archive."}</p>
              )}
            </section>

            {/* Upcoming Events */}
            {artist.events && artist.events.length > 0 && (
              <ArtistEvents events={artist.events} />
            )}

            {/* Market Insights */}
            {marketStats && (
              <section className="bg-card p-5 rounded-[10px] relative">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
                <h3 className="text-[7px] font-bold text-amber-500/60 uppercase tracking-[0.4em] mb-4 relative z-10">Market Ledger</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase group-hover/stat:text-muted-foreground transition-colors">Floor</span>
                    <span className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">{marketStats.floor} TON</span>
                  </div>
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase group-hover/stat:text-muted-foreground transition-colors">Volume</span>
                    <span className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">{marketStats.volume} TON</span>
                  </div>
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase group-hover/stat:text-muted-foreground transition-colors">Holders</span>
                    <span className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">{marketStats.holders}</span>
                  </div>
                  <button onClick={() => navigate('/marketplace')} className="w-full py-4 bg-amber-500/10 border border-blue-500/30 rounded-[10px] text-[7px] font-bold text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-background transition-all mt-4 shadow-lg shadow-amber-500/5">Trade Assets</button>
                </div>
              </section>
            )}
          </div>

          {/* Right: Content Feed */}
          <div className="lg:col-span-8">
            <div className="min-h-[500px]">
              {activeTab === 'tracks' && (
                <ArtistTracksSection 
                  artistTracks={artistTracks}
                  isOwnProfile={isOwnProfile}
                  playAll={playAll}
                  featuredNFT={featuredNFT}
                  topTracks={topTracks}
                  trackFilter={trackFilter}
                  setTrackFilter={setTrackFilter}
                  artist={artist}
                />
              )}

              {activeTab === 'collection' && (
                <ArtistNFTsSection 
                  artistNFTs={artistNFTs}
                  isOwnProfile={isOwnProfile}
                  setSelectedNftForListing={setSelectedNftForListing}
                />
              )}

              {activeTab === 'signals' && (
                <ArtistActivitySection artistPosts={artistPosts} />
              )}

              {activeTab === 'about' && (
                <div className="space-y-4 animate-in fade-in duration-700">
                  {/* Bio Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em]">Biographical Record</h2>
                      </div>
                      <div className="glass border border-blue-500/30 bg-foreground/[0.01] p-5 rounded-[12px] relative group">
                        {isEditingBio ? (
                          <div className="space-y-4">
                            <textarea 
                              value={editedBio}
                              onChange={(e) => setEditedBio(e.target.value)}
                              className="w-full bg-background/40 border border-blue-500/40 rounded-[10px] p-4 text-sm text-muted-foreground/90 outline-none focus:border-blue-500/50 transition-all resize-none min-h-[150px]"
                              placeholder="Enter artist biography..."
                            />
                            <div className="flex justify-end gap-4">
                              <button onClick={() => setIsEditingBio(false)} className="px-4 py-4 text-[8px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">Cancel</button>
                              <button onClick={handleSaveBio} className="px-4 py-4 bg-blue-600 text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all">Save Bio</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                              {artist.bio || "No biographical data synchronized for this architect."}
                            </p>
                            {isOwnProfile && (
                              <button 
                                onClick={() => {
                                  setEditedBio(artist.bio || "");
                                  setIsEditingBio(true);
                                }}
                                className="absolute top-4 right-4 p-4 rounded-full bg-muted/50 text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em]">Network Stats</h2>
                      </div>
                      <div className="glass border border-blue-500/30 bg-foreground/[0.01] p-5 rounded-[12px] space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-blue-500/30">
                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Genre</span>
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{artist.genre}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-blue-500/30">
                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Joined</span>
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-tighter">OCT 2023</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-blue-500/30">
                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Location</span>
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-tighter">Digital Frontier</span>
                        </div>
                        <div className="flex justify-between items-center py-4">
                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</span>
                          <div className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Events Section */}
                  {artist.events && artist.events.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em]">Upcoming Transmissions</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {artist.events.map((event) => (
                          <div key={event.id} className="glass border border-blue-500/30 bg-foreground/[0.01] p-5 rounded-[12px] flex items-center justify-between group hover:border-blue-500/40 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center justify-center w-14 h-14 bg-amber-500/10 rounded-[10px] border border-blue-500/30">
                                <span className="text-[8px] font-bold text-amber-500 uppercase">{event.date.split('-')[1]}</span>
                                <span className="text-xl font-bold text-foreground tracking-tighter">{event.date.split('-')[2]}</span>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-foreground uppercase tracking-tight group-hover:text-amber-400 transition-colors">{event.title}</h4>
                                <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest mt-4">{event.venue} • {event.location}</p>
                              </div>
                            </div>
                            {event.ticketUrl && (
                              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-4 bg-amber-500 text-background rounded-[8px] text-[8px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20">
                                Get Access
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collaborations Section */}
                  {artist.collaborations && artist.collaborations.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em]">Neural Collaborations</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {artist.collaborations.map((collab) => (
                          <div key={collab.id} className="group cursor-pointer">
                            <div className="relative aspect-square rounded-[12px] overflow-hidden mb-4">
                              <img src={collab.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="h-5 w-5 text-foreground fill-current" />
                              </div>
                            </div>
                            <h4 className="text-[10px] font-bold text-foreground uppercase tracking-tight truncate">{collab.trackTitle}</h4>
                            <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest truncate mt-4">w/ {collab.artistName}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Block */}
                  <div className={`p-5 rounded-[10px] border flex flex-col md:flex-row items-center justify-between gap-4 ${artist.verified ? 'bg-neutral-600/5 border-blue-500/20' : 'bg-muted/50 border-blue-500/40'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shadow-lg ${artist.verified ? 'bg-blue-500' : 'bg-muted'}`}>
                        {artist.verified ? <ShieldCheck className="text-foreground h-6 w-6" /> : <Info className="text-muted-foreground h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground uppercase tracking-tighter">{artist.verified ? 'Verified Architect' : 'Unverified Identity'}</h4>
                        <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest mt-4">{artist.verified ? 'Confirmed Identity on TON Blockchain' : 'Identity pending verification on TON'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArtistVerification artist={artist} />
                      <button className="px-4 py-4 bg-muted/50 rounded-[10px] text-[8px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all flex items-center gap-4">
                        <ShieldAlert className="h-3 w-3" /> Report Identity
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {activeTab === 'management' && isOwnProfile && (
                <div className="space-y-4 animate-in fade-in duration-700">
                  <RoyaltyDashboard artist={artist} />
                  
                  {/* Manage Metadata Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-[10px] flex items-center justify-center">
                        <Disc className="h-4 w-4 text-purple-400" />
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
                            className={`glass border transition-all duration-300 rounded-[12px] overflow-hidden ${
                              isEditing ? 'border-neutral-500/30 bg-neutral-500/5' : 'border-blue-500/30 bg-foreground/[0.01] hover:bg-foreground/[0.03]'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <img src={track.coverUrl} className="w-12 h-12 rounded-[8px] object-cover shadow-lg" alt="" />
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">{track.title}</h4>
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
                                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                          <Check className="w-3 h-3" />
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
                                        className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
                                      />
                                    </div>

                                    <div className="space-y-4">
                                      <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Genre
                                      </label>
                                      <select 
                                        value={currentMetadata.genre}
                                        onChange={(e) => handleMetadataChange(track.id, 'genre', e.target.value)}
                                        className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all appearance-none"
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
                                        className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all resize-none"
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
                                        className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
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
                                        className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
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
                                        className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
                                      />
                                    </div>

                                    <div className="p-4 bg-neutral-600/5 border border-blue-500/30 rounded-[10px] flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                          <Disc className="w-4 h-4 text-purple-400" />
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
                                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-blue-500/30">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Royalty Splits (%)
                                      </label>
                                      <button 
                                        onClick={() => handleAddRoyaltySplit(track.id)}
                                        className="flex items-center gap-4 text-[8px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" /> Add Recipient
                                      </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      {currentMetadata.royaltySplits?.map((split: any, index: number) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                          <div className="col-span-5">
                                            <input 
                                              type="text"
                                              placeholder="Wallet Address"
                                              value={split.address}
                                              onChange={(e) => handleRoyaltySplitChange(track.id, index, 'address', e.target.value)}
                                              className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-[10px] text-foreground outline-none focus:border-blue-500/50 transition-all"
                                            />
                                          </div>
                                          <div className="col-span-3">
                                            <input 
                                              type="text"
                                              placeholder="Label (e.g. Producer)"
                                              value={split.label}
                                              onChange={(e) => handleRoyaltySplitChange(track.id, index, 'label', e.target.value)}
                                              className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-[10px] text-foreground outline-none focus:border-blue-500/50 transition-all"
                                            />
                                          </div>
                                          <div className="col-span-3 relative">
                                            <input 
                                              type="number"
                                              placeholder="%"
                                              value={split.percentage}
                                              onChange={(e) => handleRoyaltySplitChange(track.id, index, 'percentage', parseFloat(e.target.value))}
                                              className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 pr-4 text-[10px] text-foreground outline-none focus:border-blue-500/50 transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50">%</span>
                                          </div>
                                          <div className="col-span-1 flex justify-end">
                                            <button 
                                              onClick={() => handleRemoveRoyaltySplit(track.id, index)}
                                              className="p-4 text-muted-foreground/50 hover:text-red-400 transition-colors"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
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
                        <ImageIcon className="h-4 w-4 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">Profile Customization</h3>
                        <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Update your visual identity on the network</p>
                      </div>
                    </div>

                    <div className="glass border border-blue-500/30 bg-foreground/[0.01] rounded-[12px] p-5">
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            Profile Banner
                          </label>
                          <div className="relative w-full h-48 rounded-[10px] overflow-hidden group border border-blue-500/40 bg-muted/50">
                            <div 
                              className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity"
                              style={{ backgroundImage: `url(${customBanner || artist.bannerUrl || getPlaceholderImage(`banner-${artist.id}`, 1200, 400)})` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-4 bg-muted backdrop-blur-md border border-blue-500/40 rounded-[8px] text-[9px] font-bold text-foreground uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center gap-4"
                              >
                                <Upload className="h-3 w-3" /> Upload New Banner
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
                        <Tag className="h-4 w-4 text-amber-500" />
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
                            className={`glass border transition-all duration-300 rounded-[12px] overflow-hidden ${
                              isEditing ? 'border-blue-500/40 bg-amber-500/5' : 'border-blue-500/30 bg-foreground/[0.01] hover:bg-foreground/[0.03]'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div 
                                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group/item"
                                  onClick={() => navigate(`/nft/${nft.id}`)}
                                >
                                  <img src={nft.imageUrl} className="w-12 h-12 rounded-[8px] object-cover shadow-lg group-hover/item:scale-105 transition-transform" alt="" />
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
                                          <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                          <Check className="w-3 h-3" />
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
                                          className={`flex-1 py-4 rounded-[8px] border text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${currentListing.listingType === 'fixed' ? 'bg-neutral-600/10 border-neutral-500 text-neutral-500' : 'bg-muted/50 border-blue-500/40 text-muted-foreground hover:bg-muted'}`}
                                        >
                                          <Tag className="w-3 h-3" /> Fixed Price
                                        </button>
                                        <button 
                                          onClick={() => handleListingChange(nft.id, 'listingType', 'auction')}
                                          className={`flex-1 py-4 rounded-[8px] border text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${currentListing.listingType === 'auction' ? 'bg-amber-500/10 border-blue-500 text-amber-500' : 'bg-muted/50 border-blue-500/40 text-muted-foreground hover:bg-muted'}`}
                                        >
                                          <Gavel className="w-3 h-3" /> Auction
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <label className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {currentListing.listingType === 'auction' ? 'Starting Bid (TON)' : 'Sale Price (TON)'}
                                      </label>
                                      <div className="relative">
                                        <img src={TON_LOGO} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" alt="" />
                                        <input 
                                          type="number"
                                          step="0.1"
                                          value={currentListing.price}
                                          onChange={(e) => handleListingChange(nft.id, 'price', e.target.value)}
                                          className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] py-4 pl-4 pr-4 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
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
                                          className="w-full bg-background/40 border border-blue-500/40 rounded-[8px] p-4 text-xs text-foreground outline-none focus:border-blue-500/50 transition-all"
                                        />
                                        <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-4">Protocol will finalize at 00:00 UTC on selected date</p>
                                      </div>
                                    )}

                                    <div className="p-4 bg-amber-500/5 border border-blue-500/30 rounded-[10px] flex gap-4">
                                      <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-4" />
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
                        <div className="py-4 text-center bg-muted/50 border border-blue-500/40 rounded-[12px]">
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
                          <div key={event.id} className="flex justify-between items-center p-4 rounded-[10px] bg-muted/50 border border-blue-500/40">
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{event.title}</h4>
                              <p className="text-[10px] text-muted-foreground">{event.date} @ {event.time} • {event.venue}, {event.location}</p>
                            </div>
                            {event.ticketUrl && (
                              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-4 bg-blue-600 text-foreground rounded-[8px] text-[8px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all">Tickets</a>
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
                          <div key={collab.id} className="p-4 rounded-[10px] bg-muted/50 border border-blue-500/40 flex flex-col items-center text-center">
                            <img src={collab.coverUrl} alt={collab.trackTitle} className="w-16 h-16 rounded-[8px] mb-4 object-cover" />
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
    </div>
  );
};

export default ArtistProfile;
