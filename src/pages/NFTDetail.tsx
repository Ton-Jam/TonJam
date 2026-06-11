import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pause,
  Play,
  CheckCircle2,
  User,
  ExternalLink,
  Zap,
  ScrollText,
  Loader2,
  Sparkles,
  Wand2,
  Handshake,
  Crown,
  Clock,
  Check,
  X,
  LogIn,
  Satellite,
  ChevronRight,
  Video,
  Music as MusicIcon,
  Image as ImageIcon,
  FileText,
  Lock,
  Share2,
  Send,
  Coins,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Activity,
  Award,
  ArrowUpDown,
  Users,
  History,
  ArrowRight,
  ArrowRightLeft,
  QrCode,
  Copy,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  MOCK_NFTS,
  MOCK_USER,
  MOCK_TRACKS,
  TON_LOGO,
  MOCK_ARTISTS,
  APP_LOGO,
  TJ_COIN_ICON,
} from "@/constants";
import { useAudio } from "@/context/AudioContext";
import { useTokenGating } from "@/hooks/useTokenGating";
import { NFTItem, Track, NFTOffer } from "@/types";
import { fetchNFTMetadata } from "@/services/nftService";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  cancelListing,
  getActiveListingForNFT,
} from "@/services/marketplaceService";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { motion, AnimatePresence } from "motion/react";
import { Virtuoso } from 'react-virtuoso';
import * as RechartsPrimitive from "recharts";
const {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} = RechartsPrimitive as any;
import BuyNFTModal from "@/components/BuyNFTModal";
import SellNFTModal from "@/components/SellNFTModal";
import BidModal from "@/components/BidModal";
import PlaceOfferModal from "@/components/PlaceOfferModal";
import BidAcceptanceModal from "@/components/BidAcceptanceModal";
import ManageNFTModal from "@/components/ManageNFTModal";
import ShareNFTDialog from "@/components/ShareNFTDialog";
import NFTCard from "@/components/NFTCard";
import SendNFTModal from "@/components/SendNFTModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import CommentsSection from "@/components/CommentsSection";
import ReactionsSection from "@/components/ReactionsSection";
import confetti from "canvas-confetti";
import { getPlaceholderImage, cn } from "@/lib/utils";
import { PriceSparkline } from "@/components/PriceSparkline";

const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    addNotification,
    currentTrack,
    isPlaying,
    playTrack,
    allNFTs,
    updateNFT,
    setFullPlayerOpen,
    userProfile,
  } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isTipping, setIsTipping] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [inlineBidAmount, setInlineBidAmount] = useState<string>("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const localNft = useMemo(() => {
    return allNFTs.find((n) => n.id === id) || null;
  }, [id, allNFTs]);

  const [associatedTrack, setAssociatedTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "history" | "offers" | "comments" | "exclusive" | "collection"
  >("details");
  const { hasAccess } = useTokenGating(
    localNft?.tokenGating || { enabled: false, tokenType: "nft" },
  );
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [dynamicMetadata, setDynamicMetadata] = useState<NFTItem | null>(null);

  /* Modal states */
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const isOwner = useMemo(() => {
    if (!localNft) return false;
    const currentWallet = userAddress || userProfile.walletAddress;
    return localNft.owner === currentWallet;
  }, [localNft, userAddress, userProfile.walletAddress]);

  useEffect(() => {
    if (
      searchParams.get("action") === "sell" &&
      isOwner &&
      !localNft?.listingType
    ) {
      setShowListModal(true);
      // Clean up the URL
      setSearchParams({});
    }
  }, [searchParams, isOwner, localNft, setSearchParams]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<NFTOffer | null>(null);
  const [relatedSort, setRelatedSort] = useState<"default" | "bids">("default");
  const [isCancelListingConfirmOpen, setIsCancelListingConfirmOpen] =
    useState(false);
  const [offerToDecline, setOfferToDecline] = useState<string | null>(null);
  const [offerToAccept, setOfferToAccept] = useState<NFTOffer | null>(null);
  const [isCancelBidConfirmOpen, setIsCancelBidConfirmOpen] = useState(false);

  /* Price Alert System - Simulated on LocalStorage */
  const [priceAlertEnabled, setPriceAlertEnabled] = useState(false);
  const [priceAlertPercent, setPriceAlertPercent] = useState<number>(10);

  useEffect(() => {
    if (localNft) {
      const alertsData = localStorage.getItem(`nft_price_alerts_${userProfile?.uid || 'guest'}`);
      if (alertsData) {
        try {
          const alerts = JSON.parse(alertsData);
          const alertForThisNFT = alerts[localNft.id];
          if (alertForThisNFT) {
            setPriceAlertEnabled(alertForThisNFT.enabled || false);
            setPriceAlertPercent(alertForThisNFT.thresholdPercent || 10);
          } else {
            setPriceAlertEnabled(false);
            setPriceAlertPercent(10);
          }
        } catch (err) {
          console.error("Error loading price alert state", err);
        }
      } else {
        setPriceAlertEnabled(false);
        setPriceAlertPercent(10);
      }
    }
  }, [localNft?.id, userProfile]);

  const handleTogglePriceAlert = () => {
    if (!localNft) return;
    const newValue = !priceAlertEnabled;
    setPriceAlertEnabled(newValue);

    const key = `nft_price_alerts_${userProfile?.uid || 'guest'}`;
    const alertsData = localStorage.getItem(key);
    let alerts: Record<string, any> = {};
    if (alertsData) {
      try {
        alerts = JSON.parse(alertsData);
      } catch (err) {
        alerts = {};
      }
    }

    if (newValue) {
      alerts[localNft.id] = {
        enabled: true,
        thresholdPercent: priceAlertPercent,
        initialPrice: parseFloat(localNft.price) || 0
      };
      import('sonner').then(({ toast }) => {
        toast.success("Price Alert Configured", {
          description: `You will be notified when ${localNft.title} drops by ${priceAlertPercent}%.`
        });
      });
    } else {
      delete alerts[localNft.id];
      import('sonner').then(({ toast }) => {
        toast.info("Price Alert Cleared", {
          description: `Unsubscribed from price updates for ${localNft.title}.`
        });
      });
    }

    localStorage.setItem(key, JSON.stringify(alerts));
  };

  const handlePercentChange = (percent: number) => {
    setPriceAlertPercent(percent);
    if (!localNft) return;
    
    const key = `nft_price_alerts_${userProfile?.uid || 'guest'}`;
    const alertsData = localStorage.getItem(key);
    let alerts: Record<string, any> = {};
    if (alertsData) {
      try {
        alerts = JSON.parse(alertsData);
      } catch (err) {
        alerts = {};
      }
    }
    
    if (priceAlertEnabled) {
      alerts[localNft.id] = {
        enabled: true,
        thresholdPercent: percent,
        initialPrice: parseFloat(localNft.price) || 0
      };
      localStorage.setItem(key, JSON.stringify(alerts));
      import('sonner').then(({ toast }) => {
        toast.success(`Alert Delta Updated: ${percent}%`, {
          description: `Notifications will trigger if the floor price decreases by ${percent}%.`
        });
      });
    }
  };

  const handleSimulateDrop = () => {
    if (!localNft) return;
    const currentPrice = parseFloat(localNft.price) || 1.0;
    const dropAmount = (currentPrice * priceAlertPercent) / 100;
    const newPrice = (currentPrice - dropAmount).toFixed(2);

    addNotification(
      `Price Alert: ${localNft.title}'s valuation node recorded a ${priceAlertPercent}% drop down to ${newPrice} TON.`,
      "warning"
    );

    import('sonner').then(({ toast }) => {
      toast.custom((t) => (
        <div className="flex bg-[#030712]/95 backdrop-blur-md rounded-[4px] p-4 shadow-2xl items-center gap-3">
          <div className="bg-rose-500/10 p-2 rounded-full flex items-center justify-center text-rose-400">
            <TrendingDown className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
              Price Alert Triggered
            </p>
            <p className="text-[11px] text-white font-bold uppercase tracking-tight mt-0.5">
              {localNft.title} dropped by {priceAlertPercent}%!
            </p>
            <p className="text-[9px] font-mono text-zinc-400 mt-1">
              Initial: <span className="line-through">{currentPrice} TON</span> → New: <span className="text-emerald-400 font-bold font-mono">{newPrice} TON</span>
            </p>
          </div>
        </div>
      ), { duration: 5000 });
    });
  };

  const loadMetadata = () => {
    if (localNft?.contractAddress) {
      setIsFetchingMetadata(true);
      setMetadataError(null);
      fetchNFTMetadata(localNft.contractAddress)
        .then((metadata) => {
          if (!metadata) return;
          setDynamicMetadata(metadata);
        })
        .catch((err) => {
          console.error("Failed to fetch metadata", err);
          setMetadataError("Failed to sync on-chain data.");
          addNotification("Failed to fetch on-chain metadata.", "error");
        })
        .finally(() => setIsFetchingMetadata(false));
    }
  };

  useEffect(() => {
    if (localNft) {
      setAssociatedTrack(
        MOCK_TRACKS.find((t) => t.id === localNft.trackId) || null,
      );
      /* Fetch dynamic metadata */
      loadMetadata();
    }
  }, [id, localNft?.id]);

  // Sync specific NFT history from Firestore
  useEffect(() => {
    if (activeTab !== "history" || !localNft) return;
    
    // Subscribe to this specific NFT to pull latest history
    const unsub = onSnapshot(doc(db, "nfts", localNft.id), (doc) => {
      if (doc.exists()) {
        const nftData = doc.data() as NFTItem;
        if (JSON.stringify(nftData.history) !== JSON.stringify(localNft.history)) {
          // If the history field updated, sync it
           updateNFT(localNft.id, { history: nftData.history }, true);
        }
      }
    });
    return () => unsub();
  }, [activeTab, localNft?.id, localNft?.history]);

  const isActive = useMemo(
    () => currentTrack?.id === localNft?.trackId,
    [currentTrack, localNft],
  );

  const isAuction = useMemo(() => {
    return localNft?.listingType === "auction";
  }, [localNft]);

  const isAuctionEnded = useMemo(() => {
    if (!isAuction || !localNft?.auctionEndTime) return false;
    return new Date(localNft.auctionEndTime).getTime() <= Date.now();
  }, [isAuction, localNft?.auctionEndTime]);

  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!isAuction || !localNft?.auctionEndTime) return;

    const calculateTimeRemaining = () => {
      const end = new Date(localNft.auctionEndTime!).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeRemaining("Auction Ended");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [isAuction, localNft?.auctionEndTime]);

  const minNextBid = useMemo(() => {
    if (!localNft?.price) return "0";
    return (parseFloat(localNft.price) * 1.05).toFixed(2);
  }, [localNft]);

  const userOffer = useMemo(() => {
    if (!localNft || !userAddress) return null;
    return localNft.offers?.find((o) => o.offerer === userAddress) || null;
  }, [localNft, userAddress]);

  const highestOfferPrice = useMemo(() => {
    if (!localNft?.offers || localNft.offers.length === 0) return 0;
    return localNft.offers.reduce(
      (max, o) => Math.max(max, parseFloat(o.price)),
      0,
    );
  }, [localNft]);

  const handleTip = (amount: number) => {
    setIsTipping(false);

    // Simulate transaction
    addNotification(`Sending ${amount} TON to ${localNft?.creator}...`, "info");

    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#ffffff", "#60a5fa"],
      });

      addNotification(
        `You sent ${amount} TON to ${localNft?.creator}. Thank you for supporting the artist!`,
        "success",
      );
    }, 1500);
  };

  const moreFromCreator = useMemo(() => {
    if (!localNft) return [];
    return allNFTs
      .filter((n) => n.creator === localNft.creator && n.id !== localNft.id)
      .slice(0, 4);
  }, [localNft, allNFTs]);

  const relatedNfts = useMemo(() => {
    if (!localNft || !associatedTrack) return [];
    const relatedTrackIds = MOCK_TRACKS.filter(
      (t) => t.genre === associatedTrack.genre,
    ).map((t) => t.id);

    let filtered = allNFTs.filter(
      (n) => relatedTrackIds.includes(n.trackId) && n.id !== localNft.id,
    );

    if (relatedSort === "bids") {
      filtered = [...filtered].sort(
        (a, b) => (b.offers?.length || 0) - (a.offers?.length || 0),
      );
    }

    return filtered.slice(0, 4);
  }, [localNft, associatedTrack, allNFTs, relatedSort]);

  const priceHistoryData = useMemo(() => {
    if (!localNft) return [];
    const basePrice = parseFloat(localNft.price) || 0.5;
    return [
      { name: "Jan", price: basePrice * 0.4 },
      { name: "Feb", price: basePrice * 0.6 },
      { name: "Mar", price: basePrice * 0.5 },
      { name: "Apr", price: basePrice * 0.9 },
      { name: "May", price: basePrice * 0.8 },
      { name: "Jun", price: basePrice },
    ];
  }, [localNft?.price]);

  if (allNFTs.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        Loading assets...
      </div>
    );
  if (!localNft) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <h2 className="text-[20px] font-bold mb-4">Asset Not Found</h2>
          <p className="text-muted-foreground/80">
            The requested NFT could not be located.
          </p>
        </div>
      </div>
    );
  }

  const handleAction = () => {
    if (isOwner) {
      if (localNft.listingType) {
        setShowManageModal(true);
      } else {
        setShowListModal(true);
      }
    } else if (isAuction) {
      setShowBidModal(true);
    } else {
      setShowBuyModal(true);
    }
  };

  const handleInlineBid = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to place bid.", "warning");
      tonConnectUI.openModal();
      return;
    }

    const bidValue = parseFloat(inlineBidAmount);
    const minBidValue = parseFloat(minNextBid);

    if (isAuctionEnded) {
      addNotification("Auction session expired. Signal rejection.", "error");
      return;
    }

    if (isNaN(bidValue) || bidValue < minBidValue) {
      addNotification(`Minimum bid is ${minNextBid} TON`, "warning");
      return;
    }

    setIsPlacingBid(true);
    addNotification("Broadcasting bid to neural relay...", "info");

    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newOffer = {
        id: `offer-${Date.now()}`,
        offerer: userAddress,
        price: bidValue.toString(),
        timestamp: "Just now",
        duration: "24h",
      };

      updateNFT(localNft.id, {
        price: bidValue.toString(),
        offers: [newOffer, ...(localNft.offers || [])],
      });

      addNotification(`Bid of ${bidValue} TON placed!`, "success");
      setInlineBidAmount("");
    } catch (e) {
      console.error(e);
      addNotification("Bid broadcast failed.", "error");
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handlePlayClick = () => {
    if (associatedTrack) {
      playTrack(associatedTrack);
      setFullPlayerOpen(true);
    }
  };

  const handleAcceptOffer = (offer: NFTOffer) => {
    setSelectedOffer(offer);
  };

  const onConfirmAcceptance = () => {
    if (selectedOffer) {
      setOfferToAccept(selectedOffer);
      setSelectedOffer(null);
    }
  };

  const confirmAcceptOffer = async () => {
    if (!offerToAccept || !localNft) return;

    addNotification(`Accepting offer from ${offerToAccept.offerer}...`, "info");

    // Simulate blockchain delay
    setTimeout(() => {
      // Update NFT owner and clear listing
      updateNFT(localNft.id, {
        owner: offerToAccept.offerer,
        listingType: undefined,
        price: offerToAccept.price,
        offers: [], // Clear offers after sale
      });

      addNotification("Asset ownership transfer protocol complete.", "success");
      setOfferToAccept(null);
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    }, 1500);
  };

  const handleDeclineOffer = (offerer: string) => {
    setOfferToDecline(offerer);
  };

  const confirmDeclineOffer = () => {
    if (!localNft || !offerToDecline) return;
    /* Remove the offer */
    const newOffers =
      localNft.offers?.filter((o) => o.offerer !== offerToDecline) || [];
    updateNFT(localNft.id, { offers: newOffers });
    addNotification(`Offer from ${offerToDecline} rejected.`, "info");
    setOfferToDecline(null);
  };

  const handleCancelListing = () => {
    setIsCancelListingConfirmOpen(true);
  };

  const confirmCancelListing = async () => {
    if (!localNft) return;

    addNotification("Initiating listing cancellation protocol...", "info");

    try {
      const listing = await getActiveListingForNFT(localNft.id);
      if (!listing) {
        // Optimistic UI update if listing was already gone
        updateNFT(localNft.id, { listingType: undefined });
        addNotification("Listing not found, metadata synced.", "success");
        return;
      }

      await cancelListing(tonConnectUI, listing, localNft);

      updateNFT(localNft.id, { listingType: undefined });
      addNotification("Listing cancelled. Asset returned to vault.", "success");
    } catch (e) {
      console.error(e);
      addNotification("Cancellation protocol aborted.", "error");
    } finally {
      setIsCancelListingConfirmOpen(false);
    }
  };

  const handleCancelBid = () => {
    setIsCancelBidConfirmOpen(true);
  };

  const confirmCancelBid = () => {
    if (!localNft || !userAddress) return;

    addNotification("Initiating bid withdrawal protocol...", "info");

    setTimeout(() => {
      const newOffers =
        localNft.offers?.filter((o) => o.offerer !== userAddress) || [];
      updateNFT(localNft.id, { offers: newOffers });
      addNotification("Bid signal withdrawn from the relay.", "success");
      setIsCancelBidConfirmOpen(false);
    }, 1500);
  };

  const handleShare = async () => {
    if (!localNft) return;
    const shareUrl = `${window.location.origin}/nft/${localNft.id}`;
    const shareData = {
      title: localNft.title,
      text: `Check out "${localNft.title}" by ${localNft.creator || 'unknown'} on TonJam! 💎`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        addNotification("NFT shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Web Share failed, opening modal instead:", err);
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <div className="relative min-h-screen pb-4 animate-in fade-in duration-500 bg-background">
      {/* Blurred Cover Background */}
      <div className="absolute top-0 left-0 w-full h-[60vh] z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20"
          style={{ backgroundImage: `url(${localNft.imageUrl || getPlaceholderImage(`nft-${localNft.id}`)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Immersive background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {isFetchingMetadata && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <LoadingSpinner size={64} />
          <p className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em] animate-pulse mt-8">
            Syncing Neural Relay...
          </p>
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-4 pt-4">
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 px-4 py-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[9px] font-bold text-foreground/80 uppercase tracking-widest">
                On-Chain Verified
              </span>
            </div>
            <button
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-muted-foreground hover:text-blue-400 hover:border-blue-400/50 transition-all"
              title="Share Protocol"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-4 items-start">
          {/* Left Column: Artwork & Technical Specs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative group max-w-[280px] mx-auto sm:max-w-none" onClick={handlePlayClick}>
              <div className="relative aspect-square max-h-[280px] sm:max-h-none mx-auto w-full rounded-[4px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] bg-black/40 border border-white/10">
                <img
                  src={
                    localNft.imageUrl ||
                    getPlaceholderImage(`nft-${localNft.id}`)
                  }
                  className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                  alt={localNft.title}
                />

                {/* Play Overlay */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[4px] transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-24 h-24 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] border border-white/20"
                  >
                    {isActive && isPlaying ? (
                      <Pause className="h-10 w-10 text-white fill-current" />
                    ) : (
                      <Play className="h-10 w-10 text-white fill-current ml-4" />
                    )}
                  </motion.div>
                </div>

                {/* Edition Badge */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 sm:top-6 sm:left-6">
                  <div className="px-3 py-1.5 bg-background/60 backdrop-blur-xl border border-border rounded-[4px] text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    {localNft.edition}{" "}
                    <span className="text-muted-foreground ml-2 sm:ml-4">
                      Edition
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-background/60 backdrop-blur-xl border border-border rounded-[4px] text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    {localNft.minted || 0}{" "}
                    <span className="text-muted-foreground ml-1.5 sm:ml-2">
                      Minted / {localNft.supply || 0} Total
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-background/60 backdrop-blur-xl border border-border rounded-[4px] text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    {(localNft.supply || 0) - (localNft.minted || 0)}{" "}
                    <span className="text-muted-foreground ml-1.5 sm:ml-2">
                      Remaining
                    </span>
                  </div>
                </div>

                {/* Live Auction Badge */}
                {isAuction && (
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                    <div className="bg-background/60 backdrop-blur-2xl border border-border px-3 py-2 sm:px-4 sm:py-4 rounded-[4px] flex items-center justify-between shadow-2xl flex-wrap gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-4 px-3 py-1.5 sm:px-4 sm:py-4 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                          Live Auction Active
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] sm:text-[8px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5 sm:mb-1">
                          Time Remaining
                        </span>
                        <span className="text-[10px] sm:text-[12px] font-black text-amber-500 uppercase tracking-widest">
                          {timeRemaining || "Loading..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hardware-style Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  label: "BPM",
                  val: associatedTrack?.bpm || "128",
                  icon: Activity,
                  color: "text-blue-500",
                },
                {
                  label: "KEY",
                  val: associatedTrack?.key || "C#m",
                  icon: MusicIcon,
                  color: "text-purple-500",
                },
                {
                  label: "BIT",
                  val: associatedTrack?.bitrate || "FLAC",
                  icon: Zap,
                  color: "text-emerald-500",
                },
                {
                  label: "RANK",
                  val: "#12",
                  icon: Award,
                  color: "text-amber-500",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-md p-3 rounded-[4px] border border-white/5 relative overflow-hidden group transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                      {stat.label}
                    </p>
                    <stat.icon className={`h-3 w-3 ${stat.color} opacity-40`} />
                  </div>
                  <p className="text-sm font-bold text-foreground tracking-tighter font-mono">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Analysis Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[4px] p-4 sm:p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">
                    Protocol Value Analysis
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Market Floor
                  </span>
                </div>
              </div>

              <div className="h-[120px] sm:h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistoryData}>
                    <defs>
                      <linearGradient
                        id="colorPrice"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0a0a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontFamily: "Poppins, sans-serif",
                      }}
                      itemStyle={{ color: "#3b82f6" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    All Time High
                  </p>
                  <p className="text-sm font-bold text-foreground font-mono">
                    {(parseFloat(localNft.price) * 2.4).toFixed(2)} TON
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Protocol Velocity
                  </p>
                  <p className="text-sm font-bold text-emerald-500 font-mono">
                    +12.4%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Identity & Action */}
          <div className="lg:col-span-7 flex flex-col">
            <header className="mb-4">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div
                  className="flex items-center gap-4 cursor-pointer group/creator"
                  onClick={() => {
                    const artist = MOCK_ARTISTS.find(
                      (a) => a.name === localNft.creator,
                    );
                    if (artist) navigate(`/artist/${artist.uid}`);
                  }}
                >
                  <div className="relative w-10 h-10">
                    <img
                      src={
                        MOCK_ARTISTS.find((a) => a.name === localNft.creator)
                          ?.avatarUrl ||
                        getPlaceholderImage(`artist-${localNft.creator}`)
                      }
                      className="w-full h-full rounded-full object-cover"
                      alt=""
                    />
                    {MOCK_ARTISTS.find((a) => a.name === localNft.creator)
                      ?.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                      Creator
                    </span>
                    <span className="text-xs font-bold text-foreground uppercase tracking-tight group-hover:text-blue-500 transition-colors flex items-center gap-1">
                      {localNft.creator}
                      {MOCK_ARTISTS.find((a) => a.name === localNft.creator)?.verified && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </span>
                  </div>
                </div>

                <div className="w-px h-8 bg-muted"></div>

                <div
                  className="flex items-center gap-4 cursor-pointer group/owner"
                  onClick={() => {
                    if (localNft.owner === userProfile.walletAddress) {
                      navigate("/profile");
                    } else {
                      const artist = MOCK_ARTISTS.find(
                        (a) =>
                          a.walletAddress === localNft.owner ||
                          a.name === localNft.owner,
                      );
                      if (artist) navigate(`/artist/${artist.uid}`);
                    }
                  }}
                >
                  <div className="relative w-10 h-10">
                    <div className="w-full h-full rounded-full bg-muted/50 flex items-center justify-center transition-all group-hover/owner:bg-muted">
                      {MOCK_ARTISTS.find(
                        (a) =>
                          a.walletAddress === localNft.owner ||
                          a.name === localNft.owner,
                      ) ? (
                        <img
                          src={
                            MOCK_ARTISTS.find(
                              (a) =>
                                a.walletAddress === localNft.owner ||
                                a.name === localNft.owner,
                            )?.avatarUrl
                          }
                          className="w-full h-full rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground group-hover/owner:text-foreground" />
                      )}
                    </div>
                    {(MOCK_ARTISTS.find(
                      (a) =>
                        a.walletAddress === localNft.owner ||
                        a.name === localNft.owner,
                    )?.verified ||
                      (localNft.owner === userProfile.walletAddress &&
                        userProfile.isVerified)) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                      Current Owner
                    </span>
                    <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-tight group-hover:text-foreground transition-colors flex items-center gap-1">
                      {isOwner
                        ? "You (Vault)"
                        : localNft.owner
                          ? `${localNft.owner.slice(0, 6)}...${localNft.owner.slice(-4)}`
                          : "Unknown"}
                      {((MOCK_ARTISTS.find(
                        (a) =>
                          a.walletAddress === localNft.owner ||
                          a.name === localNft.owner,
                      )?.verified ||
                        (localNft.owner === userProfile.walletAddress &&
                          userProfile.isVerified)) && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      ))}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[8px] uppercase tracking-widest"
                      >
                        Holders
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["Wallet 1", "Wallet 2", "Wallet 3"].map((h) => (
                        <DropdownMenuItem
                          key={h}
                          className="text-[8px] uppercase"
                        >
                          {h}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h1 className="text-[18px] sm:text-[24px] md:text-[36px] font-bold tracking-tighter uppercase text-foreground leading-[1] mb-2">
                {localNft.title}
              </h1>

              <ReactionsSection targetId={localNft.id} targetType="nft" />

              <div className="flex items-center justify-between py-2 sm:py-4 mt-1 sm:mt-2">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">
                    Protocol ID
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-blue-500/60 uppercase tracking-widest">
                    {localNft.id.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {localNft.contractAddress && (
                    <a
                      href={`https://tonviewer.com/${localNft.contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest hover:text-blue-400 transition-colors"
                    >
                      Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    Share <Share2 className="h-3.5 w-3.5 text-blue-400" />
                  </button>
                </div>
              </div>
            </header>

            {/* Pricing Section - Hardware Style */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[4px] p-4 sm:p-8 mb-4 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] rotate-12 pointer-events-none group-hover:rotate-[30deg] transition-transform duration-1000">
                <Zap className="h-64 w-64 text-blue-500" />
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 relative z-10">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isAuction ? "bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"}`}
                    ></div>
                    <span className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                      {isAuction ? "Current Highest Bid" : "Valuation Protocol"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-[32px] sm:text-[48px] md:text-[64px] font-black text-foreground tracking-tighter leading-none">
                      {isAuction
                        ? highestOfferPrice > 0
                          ? highestOfferPrice
                          : localNft.startingBid || localNft.price
                        : localNft.price}
                    </span>
                    <span className="text-[14px] sm:text-[18px] font-black text-blue-500 uppercase tracking-tighter">
                      TON
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/5 rounded-full border border-white/5">
                      ≈ ${(parseFloat(localNft.price) * 5.2).toLocaleString()}{" "}
                      USD
                    </p>
                    <div className="h-px w-6 sm:w-8 bg-white/10"></div>
                    <p className="text-[8px] sm:text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                      +12.4% Vol
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 self-stretch md:self-end">
                  <PriceSparkline basePrice={parseFloat(localNft.price) || 0} history={localNft.history} />

                  {isAuction && (
                    <div className="bg-white/5 backdrop-blur-md p-2 rounded-[4px] border border-white/10 flex items-center justify-between gap-4 shadow-lg text-[10px]">
                      <div className="flex flex-col items-start">
                        <span className="text-[6px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          Highest Bid
                        </span>
                        <span className="text-[10px] font-black tracking-tighter text-foreground">
                          {highestOfferPrice} TON
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[6px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-0.5">
                          <Clock className="h-2 w-2" /> Time
                        </span>
                        <span className="text-[10px] font-black tracking-tighter text-amber-500 tabular-nums">
                          {timeRemaining || "00:00:00"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-row gap-2 relative z-10">
                {isOwner ? (
                  <>
                    <button
                      onClick={() =>
                        localNft.listingType
                          ? setShowManageModal(true)
                          : setShowListModal(true)
                      }
                      className="py-2 cursor-pointer transition-all bg-blue-500 text-white rounded-[4px] font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                      {localNft.listingType ? "Manage" : "Sell"}
                    </button>
                    <button
                      onClick={() => setShowManageModal(true)}
                      className="py-2 bg-white/5 hover:bg-zinc-800 text-foreground rounded-[4px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => setShowSendModal(true)}
                      className="py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-[4px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      <Send className="h-3 w-3" /> Send
                    </button>
                    {localNft.listingType && (
                      <button
                        onClick={handleCancelListing}
                        className="py-2 bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-[4px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10 hover:border-red-500/20"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleShare}
                      className="py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-[4px] font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      <Share2 className="h-3 w-3 text-blue-400" /> Share
                    </button>
                  </>
                ) : (
                  <>
                    {isAuction ? (
                      <div className="flex-[2] flex gap-2">
                        <input
                          type="number"
                          value={inlineBidAmount}
                          onChange={(e) => setInlineBidAmount(e.target.value)}
                          placeholder={`${minNextBid}+`}
                          className="w-1/4 bg-white/5 border border-white/10 rounded-[4px] px-3 text-white font-bold outline-none focus-visible:ring-1 focus-visible:ring-amber-500 transition-all text-xs"
                        />
                        <button
                          onClick={handleInlineBid}
                          disabled={isPlacingBid || isAuctionEnded}
                          className={cn(
                            "flex-1 py-2 cursor-pointer transition-all text-white rounded-lg border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-black text-[10px] uppercase tracking-[0.3em] border flex items-center justify-center gap-2",
                            isAuctionEnded
                              ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                              : "bg-orange-500 border-orange-600",
                          )}
                        >
                          {isPlacingBid ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isAuctionEnded ? (
                            "EXPIRED"
                          ) : (
                            "Place Bid"
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAction}
                        className="flex-[2] py-2.5 cursor-pointer transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg border border-[#C0C0C0]/50 hover:brightness-110 shadow-lg hover:shadow-blue-500/20 font-black text-[10px] uppercase tracking-[0.3em] active:scale-95"
                      >
                        {isAuction ? "Place Bid" : "Acquire Asset"}
                      </button>
                    )}
                    {!isAuction && (
                      <button
                        onClick={() => setShowOfferModal(true)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-[4px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-white/10"
                      >
                        Offer
                      </button>
                    )}
                    {userOffer && (
                      <button
                        onClick={handleCancelBid}
                        className="flex-1 py-3 bg-white/5 hover:bg-red-500/10 text-red-500 rounded-[4px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-red-500/20"
                      >
                        Retract
                      </button>
                    )}
                    <button
                      onClick={() => setIsTipping(true)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-[4px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10"
                    >
                      <Coins className="h-3.5 w-3.5 text-blue-400" /> Support
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-[4px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10"
                    >
                      <Share2 className="h-3.5 w-3.5 text-blue-400" /> Share
                    </button>
                  </>
                )}
              </div>

              {/* Tip Selection Modal */}
              <AnimatePresence>
                {isTipping && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsTipping(false)}
                      className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-sm bg-card rounded-[4px] p-4 overflow-hidden"
                    >
                      {/* Hardware style scanline */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Coins className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                              Tip Creator
                            </h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              Support {localNft.creator}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {[0.1, 0.5, 1, 5].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => handleTip(amount)}
                              className="group relative py-4 bg-muted/50 hover:bg-muted rounded-[4px] transition-all active:scale-95"
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                                  {amount}
                                </span>
                                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                  TON
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setIsTipping(false)}
                          className="w-full py-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Price Alert Control panel - Styled premium, no border lines */}
              <div id="price-alert-panel" className="mt-6 pt-5 bg-white/[0.02] rounded-[4px] p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full flex items-center justify-center transition-all duration-300",
                      priceAlertEnabled ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-muted-foreground/40"
                    )}>
                      {priceAlertEnabled ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">
                        Price Alert Protocol
                      </h4>
                      <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                        Monitor floor drops & receive instant push signals
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {priceAlertEnabled && (
                      <button
                        onClick={handleSimulateDrop}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-[4px] font-bold text-[8px] uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1"
                        id="simulate-drop-btn"
                        title="Simulate a sudden floor drop to test your alerts"
                      >
                        <TrendingDown className="h-3 w-3" /> Simulate Drop
                      </button>
                    )}
                    
                    <button
                      onClick={handleTogglePriceAlert}
                      className={cn(
                        "px-4 py-1.5 rounded-[4px] font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer focus:outline-none",
                        priceAlertEnabled 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500" 
                          : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                      )}
                      id="price-alert-toggle-btn"
                    >
                      {priceAlertEnabled ? "Active Alert" : "Enable Alert"}
                    </button>
                  </div>
                </div>

                {/* Drop Percentage Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-center">
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                      Trigger Delta
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      Notify me when floor drops by {priceAlertPercent}% or more.
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end">
                    {[5, 10, 15, 25, 40].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => handlePercentChange(percent)}
                        className={cn(
                          "px-2.5 py-1 text-[9px] font-mono font-bold rounded-[3px] transition-all cursor-pointer focus:outline-none",
                           priceAlertPercent === percent
                            ? "bg-blue-600 text-white font-black"
                            : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/8"
                        )}
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Lore / Origin Narrative - Removed */}

            {/* Information Tabs */}
            <div className="flex items-center gap-4 mb-4">
              {[
                "details",
                "history",
                "offers",
                "comments",
                ...((isOwner || hasAccess) && localNft.exclusiveContent?.length
                  ? ["exclusive"]
                  : []),
                ...(isOwner ? ["collection"] : []),
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all relative ${activeTab === tab ? "text-blue-500" : "text-muted-foreground/50 hover:text-foreground"}`}
                >
                  {tab === "exclusive" ? "Holder Perks" : tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    ></motion.div>
                  )}
                </button>
              ))}
            </div>
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {metadataError && (
                      <div className="col-span-full p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-[4px] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <X className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4">
                              Sync Error Detected
                            </p>
                            <p className="text-xs text-red-400/80 font-medium">
                              {metadataError}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={loadMetadata}
                          className="px-4 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                        >
                          Retry Sync
                        </button>
                      </div>
                    )}

                    {(localNft.traits ||
                      (dynamicMetadata && dynamicMetadata.traits)) && (
                      <div className="col-span-full space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/20"></div>
                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                            On-Chain DNA Attributes
                          </h4>
                          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/20"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(localNft.traits || dynamicMetadata!.traits!).map(
                            (trait) => (
                              <div
                                key={trait.trait_type}
                                className="bg-white/[0.03] border border-white/5 p-6 rounded-[4px] hover:border-blue-500/30 transition-all group"
                              >
                                <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] block mb-4">
                                  {trait.trait_type}
                                </span>
                                <span className="text-sm font-black text-foreground tracking-tight uppercase">
                                  {trait.value}
                                </span>
                                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 w-2/3 group-hover:w-full transition-all duration-1000"></div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    <div className="col-span-full md:col-span-2 space-y-4">
                      <div className="p-8 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[4px]">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                          Protocol Distribution
                        </h4>
                        <div className="space-y-6">
                          {localNft.royaltySplits &&
                          localNft.royaltySplits.length > 0 ? (
                            localNft.royaltySplits.map((split, i) => (
                              <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-foreground uppercase tracking-widest">
                                    {split.label || "Collaborator"}
                                  </span>
                                  <span className="text-sm font-black text-emerald-500">
                                    {(split.percentage * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${split.percentage * 100}%`,
                                    }}
                                    className="h-full bg-emerald-500"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                              Standard 100% Creator Share Protocol Active
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-full md:col-span-1 space-y-4">
                      <div className="p-8 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[4px] flex flex-col justify-center">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                          <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                          Provenance
                        </h4>
                        <div className="space-y-6">
                          <div className="flex flex-col gap-2">
                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                              Minted Date
                            </span>
                            <span className="text-sm font-black text-foreground uppercase tracking-tight">
                              OCT 14, 2023
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                              Standard
                            </span>
                            <span className="text-sm font-black text-purple-500 uppercase tracking-tight">
                              TON NFT-v2
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                              Relay Layer
                            </span>
                            <span className="text-sm font-black text-foreground uppercase tracking-tight">
                              Global Consensus
                            </span>
                          </div>
                        </div>
                      </div>

                      {localNft.contractAddress && (
                        <div className="p-6 bg-white/[0.02] backdrop-blur-md rounded-[4px] flex flex-col items-center justify-center text-center space-y-4">
                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3 w-full text-left">
                            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                            TON Explorer QR
                          </h4>
                          <div className="p-3 bg-white rounded-[4px] shadow-lg transition-transform hover:scale-105 duration-300">
                            <QRCodeSVG
                              value={`https://tonviewer.com/${localNft.contractAddress}`}
                              size={130}
                              bgColor={"#ffffff"}
                              fgColor={"#030712"}
                              level={"M"}
                              includeMargin={true}
                            />
                          </div>
                          <div className="space-y-1.5 w-full">
                            <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
                              Asset Contract Address
                            </p>
                            <div className="flex items-center justify-between bg-white/5 rounded-[4px] p-2 font-mono text-[9px] text-zinc-400">
                              <span className="truncate max-w-[140px] sm:max-w-none">
                                {localNft.contractAddress}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(localNft.contractAddress!);
                                  setCopiedAddress(true);
                                  setTimeout(() => setCopiedAddress(false), 2000);
                                }}
                                className="ml-2 hover:text-white transition-colors cursor-pointer"
                                title="Copy Address"
                              >
                                {copiedAddress ? (
                                  <span className="text-emerald-400 font-bold">Copied</span>
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                            <a
                              href={`https://tonviewer.com/${localNft.contractAddress}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[8.5px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest mt-1"
                            >
                              Open Explorer <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {isAuction && (
                      <div className="col-span-full space-y-4">
                        <div className="p-8 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[4px]">
                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                            <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                            Active Bids
                          </h4>
                          <div className="space-y-4">
                            {localNft.offers && localNft.offers.length > 0 ? (
                              [...localNft.offers]
                                .sort(
                                  (a, b) =>
                                    parseFloat(b.price) - parseFloat(a.price),
                                )
                                .map((offer, i) => {
                                  const isTopBid =
                                    parseFloat(offer.price) ===
                                    highestOfferPrice;
                                  return (
                                    <div
                                      key={offer.id || i}
                                      className={cn(
                                        "flex items-center justify-between p-4 rounded-[4px] border transition-all hover:bg-white/[0.04]",
                                        isTopBid
                                          ? "bg-amber-500/10 border-amber-500/30"
                                          : "bg-white/[0.02] border-white/5",
                                      )}
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="relative">
                                          <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-white/10">
                                            <img
                                              src={`https://picsum.photos/100/100?seed=${offer.offerer}`}
                                              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                              alt=""
                                            />
                                          </div>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-black text-foreground uppercase tracking-widest">
                                            @{(offer.offerer || "").slice(0, 8)}
                                            ...
                                          </span>
                                          <div className="flex flex-col gap-0.5 mt-0.5">
                                            {isTopBid && (
                                              <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">
                                                Highest Bidder
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-base font-black text-foreground">
                                          {offer.price} TON
                                        </span>
                                        <span className="block text-[8px] text-muted-foreground uppercase tracking-widest mt-1">
                                          {new Date(
                                            offer.timestamp || Date.now(),
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                            ) : (
                              <div className="text-center py-12 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                No bids placed yet
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "history" && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/[0.02] border border-border rounded-[4px] p-6 lg:p-8"
                  >
                    <div className="relative pl-6 sm:pl-0">
                      {/* Vertical line - hidden on small screens if we wanted it to be centered, but let's make it left-aligned */}
                      <div className="absolute left-[31px] sm:left-[35px] top-0 bottom-0 w-px bg-white/10" />

                      <div className="nft-history-list h-[500px]">
                        {localNft.history && localNft.history.length > 0 ? (
                          <Virtuoso
                            style={{ height: '100%', width: '100%' }}
                            data={[...(localNft.history || [])].sort(
                              (a, b) =>
                                new Date(b.date).getTime() -
                                new Date(a.date).getTime()
                            )}
                            itemContent={(i, h) => (
                              <div className="pb-8">
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i < 10 ? i * 0.1 : 0 }}
                                  className="relative flex items-start gap-6 sm:gap-8 group"
                                >
                                  <div className="relative z-10 flex-shrink-0 mt-1">
                                    <div
                                      className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 border-background transition-all shadow-xl",
                                        h.event === "Minted"
                                          ? "bg-blue-500 shadow-blue-500/20"
                                          : h.event === "Transfer"
                                            ? "bg-purple-500 shadow-purple-500/20"
                                            : h.event === "Sold"
                                              ? "bg-emerald-500 shadow-emerald-500/20"
                                              : "bg-zinc-500 shadow-zinc-500/20",
                                      )}
                                    >
                                      {h.event === "Minted" ? (
                                        <Wand2 className="h-4 w-4 text-white" />
                                      ) : h.event === "Transfer" ? (
                                        <ArrowRightLeft className="h-4 w-4 text-white" />
                                      ) : (
                                        <Handshake className="h-4 w-4 text-white" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-[4px] p-3 hover:bg-white/[0.05] transition-colors relative overflow-hidden group-hover:border-white/10">
                                    <div className="absolute top-0 right-0 p-2 opacity-5 rotate-12 scale-150 pointer-events-none transition-transform group-hover:scale-110">
                                      {h.event === "Minted" ? (
                                        <Wand2 className="w-16 h-16" />
                                      ) : (
                                        <Handshake className="w-16 h-16" />
                                      )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
                                            {h.event}
                                          </h4>
                                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded-[4px]">
                                            {h.date}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 pt-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                          From
                                          <span className="font-mono text-primary">
                                            {h.from === "Vault"
                                              ? "GENESIS"
                                              : `@${(h.from || "").slice(0, 6)}`}
                                          </span>
                                          <ArrowRight className="w-2.5 h-2.5" />
                                          To
                                          <span className="font-mono text-primary">
                                            @{(h.to || "").slice(0, 6)}
                                          </span>
                                        </div>
                                      </div>
                                      {h.price && (
                                        <div className="flex items-center gap-1.5 bg-background/50 rounded-[4px] px-2 py-1">
                                          <span className="text-xs font-black text-foreground tracking-tighter tabular-nums">
                                            {h.price}
                                          </span>
                                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                                            TON
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          />
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/5 rounded-2xl ml-16 sm:ml-[4.5rem]">
                            <History className="w-8 h-8 text-muted-foreground/30 mb-3" />
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                              No transaction history
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "offers" && (
                  <motion.div
                    key="offers"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2 no-scrollbar overflow-y-auto max-h-[400px]"
                  >
                    {localNft.offers && localNft.offers.length > 0 ? (
                      localNft.offers.map((o) => {
                        const isTopBid =
                          parseFloat(o.price) === highestOfferPrice;
                        return (
                          <div
                            key={o.id}
                            className={`group p-2 bg-white/[0.02] border transition-all rounded-[4px] flex flex-row items-center justify-between gap-2 hover:bg-white/[0.04] ${isTopBid ? (isAuction ? "border-amber-500/50 bg-amber-500/[0.05]" : "border-blue-500/50 bg-blue-500/[0.05]") : "border-white/5 opacity-80 hover:opacity-100"}`}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="relative">
                                <div
                                  className={`w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden`}
                                >
                                  <img
                                    src={`https://picsum.photos/100/100?seed=${o.offerer}`}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    alt=""
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-xs font-black text-foreground uppercase truncate">
                                  @{(o.offerer || "").slice(0, 6)}...
                                </span>
                                {isTopBid && (
                                  <span
                                    className={`text-[7px] w-fit px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ${isAuction ? "bg-amber-500 text-black" : "bg-blue-500 text-white"}`}
                                  >
                                    Top
                                  </span>
                                )}
                              </div>
                              <div className="ml-auto text-right">
                                <span className="text-xs font-black text-foreground">
                                  {o.price} TON
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-muted-foreground/50 text-[10px] font-bold uppercase tracking-widest">
                        No offers yet
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "comments" && (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <CommentsSection targetId={localNft.id} targetType="nft" />
                  </motion.div>
                )}

                {activeTab === "collection" && isOwner && (
                  <motion.div
                    key="collection"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {allNFTs
                      .filter(
                        (n) =>
                          n.owner ===
                          (userAddress || userProfile.walletAddress),
                      )
                      .map((nft) => (
                        <NFTCard key={nft.id} nft={nft} />
                      ))}
                  </motion.div>
                )}

                {activeTab === "exclusive" && (
                  <AnimatePresence mode="wait">
                    {isOwner || hasAccess ? (
                      <motion.div
                        key="exclusive-content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-purple-500/[0.03] border border-blue-500/30 rounded-[4px] relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                            <Crown className="h-24 w-24 text-purple-500" />
                          </div>
                          <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-[4px] bg-purple-500/10 flex items-center justify-center">
                              <Crown className="h-6 w-6 text-purple-500" />
                            </div>
                            <h1 className="text-sm font-bold text-foreground uppercase tracking-widest">
                              Holder-Only Archives
                            </h1>
                          </div>
                          <p className="text-sm text-muted-foreground/80 leading-relaxed mb-4 relative z-10 max-w-2xl">
                            As the verified holder of the required protocol
                            assets, you have unlocked access to the following
                            exclusive sonic and visual artifacts.
                          </p>
                          <div className="grid grid-cols-1 gap-4 relative z-10">
                            {localNft.exclusiveContent?.map((item) => (
                              <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-4 bg-background/40 hover:bg-background/60 rounded-[4px] border border-border/50 hover:border-neutral-500/30 transition-all group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-[4px] bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                    {item.type === "video" && (
                                      <Video className="h-6 w-6" />
                                    )}
                                    {item.type === "track" && (
                                      <MusicIcon className="h-6 w-6" />
                                    )}
                                    {item.type === "image" && (
                                      <ImageIcon className="h-6 w-6" />
                                    )}
                                    {item.type === "document" && (
                                      <FileText className="h-6 w-6" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                                      {item.title}
                                    </p>
                                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-4">
                                      {item.type} artifact
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-[9px] font-bold text-purple-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    Access Protocol
                                  </span>
                                  <ExternalLink className="h-5 w-5 text-muted-foreground/50 group-hover:text-purple-500 transition-colors" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="exclusive-locked"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-8 bg-background/40 border border-border rounded-[4px] flex flex-col items-center justify-center text-center space-y-4"
                      >
                        <Lock className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                          <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                            Access Locked
                          </h3>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 max-w-xs">
                            Holders of{" "}
                            {localNft.tokenGating?.tokenType === "nft"
                              ? "this NFT collection"
                              : "the required tokens"}{" "}
                            are granted access to these artifacts.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* More from Creator Section */}
        {moreFromCreator.length > 0 && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
                <div>
                  <h2 className="text-base font-bold tracking-tighter uppercase text-foreground">
                    More from {localNft.creator}
                  </h2>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] mt-0.5">
                    Extended Discography
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/artist/${localNft.creator}`)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-foreground uppercase tracking-[0.3em] transition-all flex items-center h-10 group"
              >
                VIEW ALL{" "}
                <ChevronRight className="ml-4 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moreFromCreator.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        )}

        {/* Related NFTs Section */}
        {relatedNfts.length > 0 && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)]"></div>
                <div>
                  <h2 className="text-base font-bold tracking-tighter uppercase text-foreground">
                    Related {associatedTrack?.genre} Vibes
                  </h2>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] mt-0.5">
                    Sonic Affinities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10 items-center justify-center h-10 gap-1.5">
                  <button
                    onClick={() => setRelatedSort("default")}
                    className={cn(
                      "px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer h-8 flex items-center justify-center",
                      relatedSort === "default"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "text-muted-foreground hover:text-white"
                    )}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => setRelatedSort("bids")}
                    className={cn(
                      "px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer h-8 flex items-center justify-center gap-1.5",
                      relatedSort === "bids"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "text-muted-foreground hover:text-white"
                    )}
                  >
                    <ArrowUpDown className="h-3 w-3" /> Most Bids
                  </button>
                </div>
                <button
                  onClick={() => navigate("/explore/nfts?title=Related Vibes")}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-foreground uppercase tracking-[0.3em] transition-all flex items-center h-10 group"
                >
                  EXPLORE GENRE{" "}
                  <ChevronRight className="ml-4 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedNfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conditional Modals */}
      {showBuyModal && (
        <BuyNFTModal nft={localNft} onClose={() => setShowBuyModal(false)} />
      )}
      {showOfferModal && (
        <PlaceOfferModal
          nft={localNft}
          onClose={() => setShowOfferModal(false)}
        />
      )}
      {showListModal && (
        <SellNFTModal nft={localNft} onClose={() => setShowListModal(false)} />
      )}
      {showBidModal && (
        <BidModal nft={localNft} onClose={() => setShowBidModal(false)} />
      )}
      {showSendModal && (
        <SendNFTModal
          nft={localNft}
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
        />
      )}
      {showManageModal && (
        <ManageNFTModal
          nft={localNft}
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
        />
      )}
      {selectedOffer && (
        <BidAcceptanceModal
          nft={localNft}
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onAccept={onConfirmAcceptance}
        />
      )}

      {showShareModal && localNft && (
        <ShareNFTDialog
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          nft={localNft}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isCancelListingConfirmOpen}
        onClose={() => setIsCancelListingConfirmOpen(false)}
        onConfirm={confirmCancelListing}
        title="Cancel Listing?"
        description="Are you sure you want to cancel this listing? The asset will be returned to your vault."
        confirmText="Cancel Listing"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={!!offerToDecline}
        onClose={() => setOfferToDecline(null)}
        onConfirm={confirmDeclineOffer}
        title="Decline Offer?"
        description={`Are you sure you want to decline the offer from ${offerToDecline}?`}
        confirmText="Decline Offer"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={!!offerToAccept}
        onClose={() => setOfferToAccept(null)}
        onConfirm={confirmAcceptOffer}
        title="Accept Offer?"
        description={`Are you sure you want to accept the offer of ${offerToAccept?.price} TON from ${offerToAccept?.offerer}? This will transfer ownership of the NFT.`}
        confirmText="Accept Offer"
      />

      <ConfirmationModal
        isOpen={isCancelBidConfirmOpen}
        onClose={() => setIsCancelBidConfirmOpen(false)}
        onConfirm={confirmCancelBid}
        title="Withdraw Bid?"
        description={`Are you sure you want to withdraw your bid for "${localNft?.title}"? This will remove your signal from the relay network.`}
        confirmText="Withdraw Bid"
        variant="destructive"
      />
    </div>
  );
};

export default NFTDetail;
