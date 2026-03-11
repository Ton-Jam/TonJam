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
  Share2
} from 'lucide-react';

import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, TON_LOGO } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import SocialFeed from '@/components/SocialFeed';
import MintModal from '@/components/MintModal';
import UploadTrackModal from '@/components/UploadTrackModal';
import VerifyArtistModal from '@/components/VerifyArtistModal';
import RoyaltyDashboard from '@/components/RoyaltyDashboard';
import EditArtistProfileModal from '@/components/EditArtistProfileModal';
import NFTMetadataManager from '@/components/NFTMetadataManager';
import SellNFTModal from '@/components/SellNFTModal';
import { useAudio } from '@/context/AudioContext';
import { Artist, Track, Post, NFTItem } from '@/types';
import { useTonConnectUI } from '@tonconnect/ui-react';

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, playAll, currentTrack, isPlaying, followedUserIds, toggleFollowUser, userProfile, artists, setArtists, updateNFT } = useAudio();
  const [activeTab, setActiveTab] = useState<'tracks' | 'collection' | 'signals' | 'about' | 'management'>('tracks');
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

  const handleTipArtist = async () => {
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
            amount: "100000000", // 0.1 TON in nanoton
          }
        ]
      };
      
      await tonConnectUI.sendTransaction(transaction);
      addNotification(`Successfully tipped ${artist?.name} 0.1 TON! Transaction broadcasted.`, "success");
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
  const artistNFTs = useMemo(() => MOCK_NFTS.filter(n => n.creator === artist?.name), [artist]);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Disc className="h-12 w-12 text-white/10 mb-4 animate-spin-slow" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Artist Not Found</p>
        <button onClick={() => navigate(-1)} className="mt-6 text-blue-500 font-bold text-[10px] uppercase tracking-widest">Return to Network</button>
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

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification("File too large. Max 5MB allowed.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBanner(reader.result as string);
        addNotification("Banner protocol updated successfully.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const StatBox = ({ label, value, sub, tooltip }: { label: string, value: string, sub?: string, tooltip?: string }) => (
    <div className="flex flex-col glass border border-blue-500/10 backdrop-blur-md bg-white/[0.02] p-3 rounded-[10px] transition-all group relative">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.4em] group-hover:text-blue-400/50 transition-colors">{label}</span>
        {tooltip && (
          <div className="relative group/tooltip">
            <Info className="h-2 w-2 text-white/20 hover:text-blue-400 cursor-help transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 backdrop-blur-xl rounded-[10px] text-[8px] text-white/70 normal-case tracking-normal font-medium opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-center pointer-events-none">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-transparent border-t-white/10"></div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-white tracking-tighter leading-none group-hover:text-blue-400 transition-colors">{value}</span>
        {sub && <span className="text-[8px] font-bold text-blue-500 uppercase">{sub}</span>}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 pb-32 min-h-screen font-sans">
      {/* 1. COMPACT CINEMATIC BANNER */}
      <div className="relative h-[30vh] md:h-[35vh] overflow-hidden group/banner">
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale-[0.5] brightness-[0.3] transition-transform duration-[30s] group-hover/banner:scale-110"
          style={{ backgroundImage: `url(${customBanner || artist.bannerUrl || 'https://picsum.photos/1200/400?seed=' + artist.id})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        {/* Navigation & Share */}
        <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <button 
            onClick={async () => {
              const shareData = {
                title: `${artist.name} on TonJam`,
                text: `Check out ${artist.name}'s profile on TonJam`,
                url: window.location.href,
              };
              try {
                if (navigator.share) {
                  await navigator.share(shareData);
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                  addNotification('Profile link copied to clipboard', 'success');
                }
              } catch (err: any) {
                if (err.name !== 'AbortError') {
                  console.error('Error sharing:', err);
                }
              }
            }}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Banner Upload Trigger */}
        {isOwnProfile && (
          <div className="absolute top-6 right-6 z-40 opacity-0 group-hover/banner:opacity-100 transition-opacity">
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 glass rounded-[10px] text-[8px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2" >
              <Camera className="h-3 w-3" /> UPDATE_PROTOCOL
            </button>
            <input type="file" ref={fileInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
          </div>
        )}
      </div>

      {/* 2. INTEGRATED IDENTITY & ACTION HUB */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-30">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Profile Picture & Socials Stack */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-80 transition duration-1000"></div>
                <div className="relative p-1 rounded-full bg-black">
                  <img src={artist.avatarUrl} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover" alt={artist.name} />
                  {artist.verified && (
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
                      <Check className="text-white h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
              {/* Social Links */}
              {artist.socials && (
                <div className="flex gap-2">
                  {artist.socials.x && (
                    <a href={artist.socials.x} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-[10px] bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all group">
                      <Twitter className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {artist.socials.spotify && (
                    <a href={artist.socials.spotify} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-[10px] bg-white/5 flex items-center justify-center text-white/20 hover:text-[#1DB954] hover:border-[#1DB954]/50 transition-all group">
                      <Disc className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {artist.socials.instagram && (
                    <a href={artist.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-[10px] bg-white/5 flex items-center justify-center text-white/20 hover:text-[#E4405F] hover:border-[#E4405F]/50 transition-all group">
                      <Instagram className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {artist.socials.website && (
                    <a href={artist.socials.website} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-[10px] bg-white/5 flex items-center justify-center text-white/20 hover:text-blue-400 hover:border-blue-400/50 transition-all group">
                      <Globe className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {artist.socials.telegram && (
                    <a href={artist.socials.telegram} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-[10px] bg-white/5 flex items-center justify-center text-white/20 hover:text-[#0088cc] hover:border-[#0088cc]/50 transition-all group">
                      <Send className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left mb-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[7px] font-bold text-white/30 uppercase tracking-[0.4em]">NODE_SYNC: ACTIVE</span>
              </div>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase text-white leading-none">
                  {artist.name}
                </h1>
                {artist.verified && <CheckCircle className="text-blue-500 h-6 w-6 md:h-8 md:w-8" />}
                {artist.socials?.spotify && <Disc className="text-[#1DB954] h-6 w-6 md:h-8 md:w-8" />}
              </div>
              <p className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.4em] opacity-70"> @sonic_architect_{artist.id} </p>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-end gap-5">
            <div className="flex gap-8 md:gap-10">
              <StatBox label="Fans" value={(artist.followers || 0).toLocaleString()} tooltip="Total number of users synchronized with this artist's neural network." />
              <StatBox label="Tracks" value={artistTracks.length.toString()} tooltip="Total number of sonic frequencies broadcasted by this artist." />
              {marketStats && <StatBox label="Floor" value={marketStats.floor} sub="TON" tooltip="The lowest current market price for this artist's Genesis NFTs." />}
            </div>
            <div className="flex items-center gap-2">
              {isOwnProfile && (
                <button onClick={() => setShowEditProfileModal(true)} className="px-6 py-2.5 bg-white/5 text-white rounded-[10px] font-bold text-[8px] uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2" >
                  <Edit className="h-3 w-3" /> EDIT_PROFILE
                </button>
              )}
              {isOwnProfile && userProfile.isVerifiedArtist && (
                <button onClick={() => setIsUploadModalOpen(true)} className="px-6 py-2.5 bg-green-600/10 text-green-400 border border-green-500/30 rounded-[10px] font-bold text-[8px] uppercase tracking-widest hover:bg-green-500/20 active:scale-95 transition-all flex items-center gap-2" >
                  <Upload className="h-3 w-3" /> UPLOAD_TRACK
                </button>
              )}
              {isOwnProfile && userProfile.isVerifiedArtist && (
                <button onClick={() => navigate('/artist-dashboard')} className="px-6 py-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded-[10px] font-bold text-[8px] uppercase tracking-widest hover:bg-blue-500/20 active:scale-95 transition-all flex items-center gap-2" >
                  <Plus className="h-3 w-3" /> ARTIST_DASHBOARD
                </button>
              )}
              {artist.id === userProfile.id && !artist.verified && (
                <button onClick={() => setShowVerifyModal(true)} className="px-6 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-[10px] font-bold text-[8px] uppercase tracking-widest hover:bg-blue-500/20 active:scale-95 transition-all flex items-center gap-2" >
                  <ShieldCheck className="h-3 w-3" /> VERIFY_ARTIST
                </button>
              )}
              <button onClick={() => playAll(artistTracks)} className="px-6 py-2.5 electric-blue-bg text-white rounded-[10px] font-bold text-[8px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2" >
                <Play className="h-3 w-3" /> SYNC_CATALOG
              </button>
              <button 
                onClick={handleFollow} 
                className={`px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all text-[9px] font-bold uppercase tracking-widest
                  ${isFollowing 
                    ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                  }
                `}
                title={isFollowing ? "Unfollow" : "Follow"}
              >
                {isFollowing ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Tracks Relay */}
      {trendingTracks.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-4 electric-blue-bg rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <h2 className="text-[7px] font-bold text-white/40 uppercase tracking-[0.5em]">Trending Frequencies</h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
            {trendingTracks.map((track, idx) => (
              <div key={`trending-${track.id}`} className="min-w-[280px] sm:min-w-[320px] group relative" >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-[10px] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative glass border border-blue-500/10 p-4 rounded-[10px] transition-all bg-[#0a0a0a]/40 flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-[10px] overflow-hidden shadow-lg">
                    <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    <button onClick={() => playAll([track])} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" >
                      <Play className="text-white h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[7px] font-bold text-blue-500 uppercase">#{idx + 1} Trending</span>
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tighter truncate leading-tight mb-1">{track.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Play className="h-2 w-2 text-white/20" />
                        <span className="text-[8px] font-bold text-white/40">{(track.playCount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-2 w-2 text-red-500/40" />
                        <span className="text-[8px] font-bold text-white/40">{(track.likes || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Tracks Section */}
      {topTracks.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 electric-blue-bg rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Top Frequencies</h2>
            </div>
            <button onClick={() => playAll(topTracks)} className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-2 group">
              PLAY_ALL <Play className="h-3 w-3 fill-current group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {topTracks.map((track, idx) => (
              <div 
                key={`top-${track.id}`} 
                className="group flex items-center gap-4 p-3 rounded-[12px] hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
                onClick={() => playAll([track])}
              >
                <div className="w-6 text-[10px] font-bold text-white/20 group-hover:text-blue-500 transition-colors text-center">
                  {(idx + 1).toString().padStart(2, '0')}
                </div>
                <div className="relative w-12 h-12 rounded-[8px] overflow-hidden flex-shrink-0 shadow-lg">
                  <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">{track.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{track.genre}</span>
                    <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{(track.playCount || 0).toLocaleString()} STREAMS</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-white/20 group-hover:text-white/40 transition-colors">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl py-6 mt-12 mb-8 w-full px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex bg-white/5 p-1 rounded-[12px] border border-white/10">
            {['tracks', 'collection'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={`px-8 py-2.5 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white'}`}
              >
                {tab === 'collection' ? 'Collection' : tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {['signals', 'about', ...(isOwnProfile ? ['management'] : [])].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={`pb-2 text-[9px] font-bold uppercase tracking-[0.3em] transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === tab ? 'text-blue-500' : 'text-white/20 hover:text-white'}`} 
              >
                {tab}
                {activeTab === tab && <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Intelligence Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Market Insights */}
            {marketStats && (
              <section className="glass border border-blue-500/10 backdrop-blur-xl bg-white/[0.02] p-8 rounded-[10px] relative shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
                <h3 className="text-[7px] font-bold text-amber-500/60 uppercase tracking-[0.4em] mb-6 relative z-10">Market Ledger</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-bold text-white/20 uppercase group-hover/stat:text-white/40 transition-colors">Floor</span>
                    <span className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors">{marketStats.floor} TON</span>
                  </div>
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-bold text-white/20 uppercase group-hover/stat:text-white/40 transition-colors">Volume</span>
                    <span className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors">{marketStats.volume} TON</span>
                  </div>
                  <div className="flex justify-between items-center group/stat">
                    <span className="text-[8px] font-bold text-white/20 uppercase group-hover/stat:text-white/40 transition-colors">Holders</span>
                    <span className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors">{marketStats.holders}</span>
                  </div>
                  <button onClick={() => navigate('/marketplace')} className="w-full py-3 bg-amber-500/10 border border-amber-500/30 rounded-[10px] text-[7px] font-bold text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all mt-2 shadow-lg shadow-amber-500/5">Trade Assets</button>
                </div>
              </section>
            )}

            {/* Biography */}
            <section className="p-8 glass border border-blue-500/10 backdrop-blur-xl bg-white/[0.01] rounded-[10px] group/bio">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[7px] font-bold text-white/20 uppercase tracking-[0.4em]">Origin Narrative</h3>
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
                    className="w-full bg-white/5 border border-white/10 rounded-[10px] p-4 text-xs text-white/80 leading-relaxed outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none"
                    placeholder="Enter artist biography..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => setIsEditingBio(false)}
                      className="px-4 py-2 bg-white/5 text-white/40 rounded-[8px] text-[8px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveBio}
                      className="px-4 py-2 bg-blue-600 text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                    >
                      Save Protocol
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/40 leading-relaxed">{artist.bio || "No biographical record in neural archive."}</p>
              )}
            </section>
          </div>

          {/* Right: Content Feed */}
          <div className="lg:col-span-8">
            <div className="min-h-[500px]">
              {activeTab === 'tracks' && (
                <div className="space-y-12 animate-in fade-in duration-500">
                  {/* Top Tracks Section */}
                  {topTracks.length > 0 && (
                    <section className="glass border border-blue-500/10 bg-white/[0.01] rounded-[10px] p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                          <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Top Frequencies</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Live Stats</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {topTracks.map((track, idx) => (
                          <div key={`top-${track.id}`} className="group flex items-center gap-4 p-3 rounded-[10px] hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                            <span className="w-4 text-[10px] font-bold text-white/20 group-hover:text-blue-500 transition-colors">{idx + 1}</span>
                            <div className="relative w-10 h-10 rounded-[6px] overflow-hidden flex-shrink-0">
                              <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                              <button onClick={() => playAll([track])} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="h-3 w-3 text-white fill-white" />
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">{track.title}</h4>
                              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{track.genre}</p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] font-bold text-white tracking-tighter">{(track.playCount || 0).toLocaleString()}</span>
                                <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Streams</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="p-2 text-white/20 hover:text-red-500 transition-colors">
                                  <Heart className="h-3 w-3" />
                                </button>
                                <button onClick={() => playAll([track])} className="p-2 text-white/20 hover:text-blue-500 transition-colors">
                                  <Play className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* All Tracks Grid */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <List className="h-3 w-3 text-white/20" />
                      <h4 className="text-[7px] font-bold text-white/40 uppercase tracking-[0.4em]">All Frequencies</h4>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                      {artistTracks.map(t => (
                        <div key={t.id} className="min-w-[280px] sm:min-w-[320px]">
                          <TrackCard 
                            track={t} 
                            onMint={isOwnProfile ? (track) => setSelectedTrackForMint(track) : undefined}
                          />
                        </div>
                      ))}
                    </div>
                    {artistTracks.length === 0 && (
                      <div className="py-24 text-center glass border border-blue-500/10 rounded-[10px]">
                        <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">No tracks broadcasted.</p>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {activeTab === 'collection' && (
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar animate-in slide-in-from-right-4 duration-500">
                  {artistNFTs.map(n => (
                    <div key={n.id} className="min-w-[280px] sm:min-w-[320px]">
                      <NFTCard 
                        nft={n} 
                        onAction={isOwnProfile ? (nft) => setSelectedNftForListing(nft) : undefined}
                      />
                    </div>
                  ))}
                  {artistNFTs.length === 0 && (
                    <div className="w-full py-24 text-center glass border border-blue-500/10 rounded-[10px]">
                      <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">No assets detected.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'signals' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <SocialFeed posts={artistPosts} emptyMessage="Signal void detected." />
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-12 animate-in fade-in duration-700">
                  {/* Verification Block */}
                  <div className={`p-10 rounded-[10px] border flex flex-col md:flex-row items-center justify-between gap-6 ${artist.verified ? 'bg-blue-600/5 border-blue-500/10' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shadow-lg ${artist.verified ? 'bg-blue-500' : 'bg-white/10'}`}>
                        {artist.verified ? <ShieldCheck className="text-white h-6 w-6" /> : <Info className="text-white/40 h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white uppercase tracking-tighter">{artist.verified ? 'Verified Architect' : 'Unverified Identity'}</h4>
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">{artist.verified ? 'Confirmed Identity on TON Blockchain' : 'Identity pending verification on TON'}</p>
                      </div>
                    </div>
                    <button className="px-6 py-2.5 bg-white/5 rounded-[10px] text-[8px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3" /> Report Identity
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'management' && isOwnProfile && (
                <div className="space-y-12 animate-in fade-in duration-700">
                  <RoyaltyDashboard artist={artist} />
                  
                  {/* Manage Metadata Section */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-[10px] flex items-center justify-center">
                        <Disc className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Manage Metadata</h3>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Configure tracks for NFT minting protocols</p>
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
                              isEditing ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="p-6">
                              <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <img src={track.coverUrl} className="w-12 h-12 rounded-[8px] object-cover shadow-lg" alt="" />
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate uppercase tracking-tight">{track.title}</h4>
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{track.genre} • {track.isNFT ? 'NFT Protocol Active' : 'Standard Stream'}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {!isEditing ? (
                                    <button 
                                      onClick={() => handleEditMetadata(track)}
                                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
                                    >
                                      Configure Metadata
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => setEditingTrackId(null)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        onClick={() => handleSaveMetadata(track.id)}
                                        disabled={isSavingMetadata === track.id}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
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
                                <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300">
                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        Track Title
                                      </label>
                                      <input 
                                        type="text"
                                        value={currentMetadata.title}
                                        onChange={(e) => handleMetadataChange(track.id, 'title', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        Genre
                                      </label>
                                      <select 
                                        value={currentMetadata.genre}
                                        onChange={(e) => handleMetadataChange(track.id, 'genre', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all appearance-none"
                                      >
                                        {['Techno', 'House', 'Ambient', 'Phonk', 'Cyberpunk', 'Lo-Fi', 'Electronic', 'Pop'].map(g => (
                                          <option key={g} value={g}>{g}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        Description
                                      </label>
                                      <textarea 
                                        value={currentMetadata.description}
                                        onChange={(e) => handleMetadataChange(track.id, 'description', e.target.value)}
                                        rows={3}
                                        placeholder="Describe the sonic journey..."
                                        className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all resize-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        IPFS Audio URL
                                      </label>
                                      <input 
                                        type="text"
                                        value={currentMetadata.audioIpfsUrl}
                                        onChange={(e) => handleMetadataChange(track.id, 'audioIpfsUrl', e.target.value)}
                                        placeholder="ipfs://..."
                                        className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        IPFS Cover URL
                                      </label>
                                      <input 
                                        type="text"
                                        value={currentMetadata.coverIpfsUrl}
                                        onChange={(e) => handleMetadataChange(track.id, 'coverIpfsUrl', e.target.value)}
                                        placeholder="ipfs://..."
                                        className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        NFT Price (TON)
                                      </label>
                                      <input 
                                        type="number"
                                        step="0.1"
                                        value={currentMetadata.price}
                                        onChange={(e) => handleMetadataChange(track.id, 'price', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                                      />
                                    </div>

                                    <div className="p-4 bg-purple-600/5 border border-purple-500/20 rounded-[10px] flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                          <Disc className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <div>
                                          <h5 className="text-[10px] font-bold text-white uppercase tracking-tight">NFT Option</h5>
                                          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Enable NFT minting for this track</p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => handleMetadataChange(track.id, 'isNFT', !currentMetadata.isNFT)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${currentMetadata.isNFT ? 'bg-purple-500' : 'bg-white/10'}`}
                                      >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${currentMetadata.isNFT ? 'left-7' : 'left-1'}`} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Royalty Splits Section */}
                                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        Royalty Splits (%)
                                      </label>
                                      <button 
                                        onClick={() => handleAddRoyaltySplit(track.id)}
                                        className="flex items-center gap-1 text-[8px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" /> Add Recipient
                                      </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {currentMetadata.royaltySplits?.map((split: any, index: number) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                          <div className="col-span-5">
                                            <input 
                                              type="text"
                                              placeholder="Wallet Address"
                                              value={split.address}
                                              onChange={(e) => handleRoyaltySplitChange(track.id, index, 'address', e.target.value)}
                                              className="w-full bg-black/40 border border-white/10 rounded-[8px] p-2.5 text-[10px] text-white outline-none focus:border-purple-500/50 transition-all"
                                            />
                                          </div>
                                          <div className="col-span-3">
                                            <input 
                                              type="text"
                                              placeholder="Label (e.g. Producer)"
                                              value={split.label}
                                              onChange={(e) => handleRoyaltySplitChange(track.id, index, 'label', e.target.value)}
                                              className="w-full bg-black/40 border border-white/10 rounded-[8px] p-2.5 text-[10px] text-white outline-none focus:border-purple-500/50 transition-all"
                                            />
                                          </div>
                                          <div className="col-span-3 relative">
                                            <input 
                                              type="number"
                                              placeholder="%"
                                              value={split.percentage}
                                              onChange={(e) => handleRoyaltySplitChange(track.id, index, 'percentage', parseFloat(e.target.value))}
                                              className="w-full bg-black/40 border border-white/10 rounded-[8px] p-2.5 pr-8 text-[10px] text-white outline-none focus:border-purple-500/50 transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20">%</span>
                                          </div>
                                          <div className="col-span-1 flex justify-end">
                                            <button 
                                              onClick={() => handleRemoveRoyaltySplit(track.id, index)}
                                              className="p-2 text-white/20 hover:text-red-400 transition-colors"
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
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-[10px] flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Profile Customization</h3>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Update your visual identity on the network</p>
                      </div>
                    </div>

                    <div className="glass border border-white/5 bg-white/[0.01] rounded-[12px] p-6">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                            Profile Banner
                          </label>
                          <div className="relative w-full h-48 rounded-[10px] overflow-hidden group border border-white/10 bg-white/5">
                            <div 
                              className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity"
                              style={{ backgroundImage: `url(${customBanner || artist.bannerUrl || 'https://picsum.photos/1200/400?seed=' + artist.id})` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-[8px] text-[9px] font-bold text-white uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                              >
                                <Upload className="h-3 w-3" /> Upload New Banner
                              </button>
                            </div>
                          </div>
                          <p className="text-[8px] text-white/30">Recommended size: 1500x500px. Max 5MB.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marketplace Management Section */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-[10px] flex items-center justify-center">
                        <Tag className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Marketplace Management</h3>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Configure sale and auction protocols for your collection</p>
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
                              isEditing ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="p-6">
                              <div className="flex items-center justify-between gap-6">
                                <div 
                                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group/item"
                                  onClick={() => navigate(`/nft/${nft.id}`)}
                                >
                                  <img src={nft.imageUrl} className="w-12 h-12 rounded-[8px] object-cover shadow-lg group-hover/item:scale-105 transition-transform" alt="" />
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate uppercase tracking-tight group-hover/item:text-amber-400 transition-colors">{nft.title}</h4>
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                      {nft.listingType === 'auction' ? 'Active Auction' : nft.listingType === 'fixed' ? 'Fixed Price' : 'Not Listed'} • {nft.price} TON
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {!isEditing ? (
                                    <button 
                                      onClick={() => handleEditListing(nft)}
                                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
                                    >
                                      Manage Listing
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => setEditingListingId(null)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        onClick={() => handleSaveListing(nft.id)}
                                        disabled={isSavingListing === nft.id}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
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
                                <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300">
                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        Listing Type
                                      </label>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => handleListingChange(nft.id, 'listingType', 'fixed')}
                                          className={`flex-1 py-3 rounded-[8px] border text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${currentListing.listingType === 'fixed' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                        >
                                          <Tag className="w-3 h-3" /> Fixed Price
                                        </button>
                                        <button 
                                          onClick={() => handleListingChange(nft.id, 'listingType', 'auction')}
                                          className={`flex-1 py-3 rounded-[8px] border text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${currentListing.listingType === 'auction' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                        >
                                          <Gavel className="w-3 h-3" /> Auction
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        {currentListing.listingType === 'auction' ? 'Starting Bid (TON)' : 'Sale Price (TON)'}
                                      </label>
                                      <div className="relative">
                                        <img src={TON_LOGO} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" alt="" />
                                        <input 
                                          type="number"
                                          step="0.1"
                                          value={currentListing.price}
                                          onChange={(e) => handleListingChange(nft.id, 'price', e.target.value)}
                                          className="w-full bg-black/40 border border-white/10 rounded-[8px] py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-amber-500/50 transition-all"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    {currentListing.listingType === 'auction' && (
                                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                          Auction End Date
                                        </label>
                                        <input 
                                          type="date"
                                          value={currentListing.auctionEndTime}
                                          onChange={(e) => handleListingChange(nft.id, 'auctionEndTime', e.target.value)}
                                          className="w-full bg-black/40 border border-white/10 rounded-[8px] p-3 text-xs text-white outline-none focus:border-amber-500/50 transition-all"
                                        />
                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-2">Protocol will finalize at 00:00 UTC on selected date</p>
                                      </div>
                                    )}

                                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-[10px] flex gap-3">
                                      <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                      <p className="text-[9px] text-white/60 leading-relaxed uppercase tracking-widest">
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
                        <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[12px]">
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">No minted protocols available for listing.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-32"></div>
      {showVerifyModal && artist && <VerifyArtistModal onClose={() => setShowVerifyModal(false)} artistName={artist.name} />}
      {showEditProfileModal && <EditArtistProfileModal artist={artist} onClose={() => setShowEditProfileModal(false)} />}
      {isUploadModalOpen && <UploadTrackModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />}
      
      {selectedTrackForMint && (
        <MintModal 
          track={selectedTrackForMint} 
          onClose={() => setSelectedTrackForMint(null)} 
        />
      )}

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
