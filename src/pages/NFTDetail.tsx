import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  ExternalLink,
  Crown,
  X,
  ChevronRight,
  Video,
  Music as MusicIcon,
  Image as ImageIcon,
  FileText,
  Lock,
  Share2,
  Bell,
  ArrowUpDown,
  Copy,
  Coins,
  Check,
} from "lucide-react";
import { AnimatedHeart } from "@/components/common/AnimatedHeart";
import { QRCodeSVG } from "qrcode.react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TON_LOGO } from "@/constants";
import { useAudio } from "@/contexts/AudioContext";
import { useTonPrice } from "@/contexts/TonPriceContext";
import { useTokenGating } from "@/hooks/useTokenGating";
import { NFTItem, Track, NFTOffer } from "@/types";
import { fetchNFTMetadata } from "@/services/nftService";
import { sendTransactionSafe, getTonScanUrl, TON_NETWORK_MODE } from "@/services/tonService";
import { priceAlertService } from "@/services/priceAlertService";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import {
  cancelListing,
  getActiveListingForNFT,
} from "@/services/marketplaceService";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { motion, AnimatePresence } from "motion/react";
import BuyNFTModal from "@/components/BuyNFTModal";
import SellNFTModal from "@/components/SellNFTModal";
import { BidNFTModal } from "@/components/nft/BidNFTModal";
import { NFTPriceCard } from "@/components/nft/NFTPriceCard";
import { NFTActivity } from "@/components/nft/NFTActivity";
import { NFTDetailHero } from "@/components/nft/NFTDetailHero";
import { NFTArtistSpotlight } from "@/components/nft/NFTArtistSpotlight";
import PlaceOfferModal from "@/components/PlaceOfferModal";
import BidAcceptanceModal from "@/components/BidAcceptanceModal";
import ManageNFTModal from "@/components/ManageNFTModal";
import StakeNFTModal from "@/components/StakeNFTModal";
import ShareNFTDialog from "@/components/ShareNFTDialog";
import NFTCard from "@/components/NFTCard";
import SendNFTModal from "@/components/SendNFTModal";
import ReportNFTModal from "@/components/ReportNFTModal";
import PriceAlertModal from "@/components/PriceAlertModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import CommentsSection from "@/components/CommentsSection";
import confetti from "canvas-confetti";
import { getPlaceholderImage, cn } from "@/lib/utils";
import { RecentBidsList } from "@/components/RecentBidsList";
import { useNftColorPalette } from "@/hooks/useNftColorPalette";

const formatShortAddress = (addr?: string) => {
  if (!addr) return "Unknown";
  return addr.length > 14 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
};

const NFTDetail: React.FC = () => {
  const { id, nftId } = useParams<{ id?: string; nftId?: string }>();
  const effectiveId = nftId || id;
  const navigate = useNavigate();
  const {
    addNotification,
    allNFTs,
    allTracks,
    artists,
    collections,
    updateNFT,
    userProfile,
    likedTrackIds = [],
    toggleLikeTrack,
  } = useAudio();
  const { price: tonUsdRate } = useTonPrice();

  const localNft = useMemo(
    () => allNFTs.find((n) => n.id === effectiveId || n.contractAddress === effectiveId) || null,
    [effectiveId, allNFTs]
  );

  const [remoteNft, setRemoteNft] = useState<NFTItem | null>(null);
  const [dynamicMetadata, setDynamicMetadata] = useState<NFTItem | null>(null);
  const [isResolvingNft, setIsResolvingNft] = useState(false);
  const [hasCheckedRemote, setHasCheckedRemote] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const effectiveNft = localNft || remoteNft || dynamicMetadata;

  // Guarded view counter + live view listener
  useEffect(() => {
    if (!effectiveNft?.id) return;

    const incrementViews = async () => {
      try {
        const nftRef = doc(db, "nfts", effectiveNft.id);
        await updateDoc(nftRef, {
          views: increment(1),
        });
      } catch (err) {
        console.warn("Skipped remote view increment:", err);
      }
    };

    const hasViewedKey = `viewed_nft_${effectiveNft.id}`;
    if (!sessionStorage.getItem(hasViewedKey)) {
      incrementViews();
      sessionStorage.setItem(hasViewedKey, "true");
    }

    window.dispatchEvent(
      new CustomEvent("tonjam_mission_event", {
        detail: { type: "explore_nft", entityId: effectiveNft.id, amount: 1 },
      })
    );

    const unsub = onSnapshot(
      doc(db, "nfts", effectiveNft.id),
      (snap) => {
        if (snap.exists()) {
          const nftData = snap.data() as NFTItem;
          if (nftData.views !== undefined && nftData.views !== effectiveNft.views) {
            updateNFT(effectiveNft.id, { views: nftData.views }, true);
          }
        }
      },
      (error) => {
        console.warn("Error listening to NFT views:", error);
      }
    );

    return () => unsub();
  }, [effectiveNft?.id]);

  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isTipping, setIsTipping] = useState(false);
  const [customTipAmount, setCustomTipAmount] = useState("1");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isPlacingBid] = useState(false);

  const [associatedTrack, setAssociatedTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "activity" | "offers" | "comments" | "exclusive" | "collection"
  >("details");

  const { hasAccess } = useTokenGating(
    effectiveNft?.tokenGating || { enabled: false, tokenType: "nft" }
  );

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<NFTOffer | null>(null);
  const [relatedSort, setRelatedSort] = useState<"default" | "bids">("default");
  const [isCancelListingConfirmOpen, setIsCancelListingConfirmOpen] =
    useState(false);
  const [offerToDecline, setOfferToDecline] = useState<string | null>(null);
  const [offerToAccept, setOfferToAccept] = useState<NFTOffer | null>(null);
  const [isCancelBidConfirmOpen, setIsCancelBidConfirmOpen] = useState(false);

  const [priceAlertEnabled, setPriceAlertEnabled] = useState(false);
  const [priceAlertPercent, setPriceAlertPercent] = useState<number>(10);

  const salesData = useMemo(() => {
    if (!effectiveNft?.history) return [];
    const soldEvents = [...effectiveNft.history]
      .reverse()
      .filter((h) => h.event === "Sold" && h.price);
    return soldEvents.map((h) => ({
      date: h.date,
      value: parseFloat(h.price!),
    }));
  }, [effectiveNft]);

  const isOwner = useMemo(() => {
    if (!effectiveNft) return false;
    const currentWallet = userAddress || userProfile?.walletAddress;
    return (
      (Boolean(currentWallet) && effectiveNft.owner === currentWallet) ||
      (Boolean(userProfile?.uid) && effectiveNft.owner === userProfile?.uid)
    );
  }, [effectiveNft, userAddress, userProfile]);

  const { primaryColor, secondaryColor, accentColor, radialGradient } =
    useNftColorPalette(effectiveNft);

  useEffect(() => {
    if (
      searchParams.get("action") === "sell" &&
      isOwner &&
      !effectiveNft?.listingType
    ) {
      setShowListModal(true);
      setSearchParams({});
    }
  }, [searchParams, isOwner, effectiveNft, setSearchParams]);

  const activeUserId = userProfile?.uid || "guest_user";

  // Sync alert state with Firestore-backed priceAlertService
  useEffect(() => {
    if (!effectiveNft) return;
    const existing = priceAlertService.getAlertForNFT(activeUserId, effectiveNft.id);
    if (existing) {
      setPriceAlertEnabled(true);
      const currentNum = parseFloat(effectiveNft.price || "0");
      const targetNum = parseFloat(existing.targetPrice || "0");
      if (currentNum > 0 && targetNum > 0 && targetNum < currentNum) {
        const computedPct = Math.round(((currentNum - targetNum) / currentNum) * 100);
        setPriceAlertPercent(
          [5, 10, 20].includes(computedPct) ? computedPct : 10
        );
      }
    } else {
      setPriceAlertEnabled(false);
      setPriceAlertPercent(10);
    }
  }, [effectiveNft?.id, activeUserId]);

  const handleTogglePriceAlert = async () => {
    if (!effectiveNft) return;
    const nextEnabled = !priceAlertEnabled;
    setPriceAlertEnabled(nextEnabled);

    const basePrice = parseFloat(effectiveNft.price || "0") || 0;
    const targetPrice = Math.max(
      0.01,
      basePrice * (1 - priceAlertPercent / 100)
    ).toFixed(2);

    if (nextEnabled) {
      await priceAlertService.saveAlert({
        id: `alert-${activeUserId}-${effectiveNft.id}`,
        userId: activeUserId,
        nftId: effectiveNft.id,
        nftTitle: effectiveNft.title,
        nftImageUrl: effectiveNft.imageUrl,
        targetPrice,
        condition: "below",
        status: "active",
        channels: ["app", "push"],
        createdAt: new Date().toISOString(),
      });
      import("sonner").then(({ toast }) => {
        toast.success("Price Alert Enabled", {
          description: `Alert set if ${effectiveNft.title} drops ${priceAlertPercent}% (≤ ${targetPrice} TON).`,
        });
      });
    } else {
      const existing = priceAlertService.getAlertForNFT(activeUserId, effectiveNft.id);
      if (existing) {
        await priceAlertService.deleteAlert(activeUserId, existing.id);
      }
      import("sonner").then(({ toast }) => {
        toast.info("Price Alert Removed", {
          description: `Alerts turned off for ${effectiveNft.title}.`,
        });
      });
    }
  };

  const handlePercentChange = async (percent: number) => {
    setPriceAlertPercent(percent);
    if (!effectiveNft || !priceAlertEnabled) return;

    const basePrice = parseFloat(effectiveNft.price || "0") || 0;
    const targetPrice = Math.max(
      0.01,
      basePrice * (1 - percent / 100)
    ).toFixed(2);

    await priceAlertService.saveAlert({
      id: `alert-${activeUserId}-${effectiveNft.id}`,
      userId: activeUserId,
      nftId: effectiveNft.id,
      nftTitle: effectiveNft.title,
      nftImageUrl: effectiveNft.imageUrl,
      targetPrice,
      condition: "below",
      status: "active",
      channels: ["app", "push"],
      createdAt: new Date().toISOString(),
    });

    import("sonner").then(({ toast }) => {
      toast.success(`Alert Threshold: -${percent}%`, {
        description: `Target updated to ≤ ${targetPrice} TON.`,
      });
    });
  };

  // Resolve NFT directly from Firestore on deep link or enrich contract metadata cleanly
  useEffect(() => {
    setRemoteNft(null);
    setDynamicMetadata(null);
    setHasCheckedRemote(false);
    setMetadataError(null);

    if (!effectiveId) {
      setHasCheckedRemote(true);
      return;
    }

    if (localNft) {
      setHasCheckedRemote(true);
      return;
    }

    let cancelled = false;
    setIsResolvingNft(true);
    fetchNFTMetadata(effectiveId)
      .then((fetched) => {
        if (!cancelled && fetched) {
          setRemoteNft(fetched);
        }
      })
      .catch((err) => {
        console.error("Failed to resolve NFT metadata:", err);
        if (!cancelled) {
          setMetadataError("Unable to sync on-chain metadata.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsResolvingNft(false);
          setHasCheckedRemote(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveId, Boolean(localNft)]);

  const loadMetadata = () => {
    const lookupKey = effectiveNft?.contractAddress || effectiveNft?.id || effectiveId;
    if (!lookupKey) return;
    setMetadataError(null);
    fetchNFTMetadata(lookupKey)
      .then((metadata) => {
        if (metadata) {
          setDynamicMetadata(metadata);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch metadata", err);
        setMetadataError("Unable to sync on-chain metadata.");
      });
  };

  useEffect(() => {
    if (effectiveNft) {
      setAssociatedTrack(
        allTracks.find((t) => t.id === effectiveNft.trackId) || null
      );
      if (effectiveNft.contractAddress && !dynamicMetadata) {
        loadMetadata();
      }
    }
  }, [effectiveNft?.id, allTracks]);

  // Real-time NFT history listener when viewing Activity
  useEffect(() => {
    if (activeTab !== "activity" || !effectiveNft) return;
    const unsub = onSnapshot(
      doc(db, "nfts", effectiveNft.id),
      (snap) => {
        if (snap.exists()) {
          const nftData = snap.data() as NFTItem;
          if (JSON.stringify(nftData.history) !== JSON.stringify(effectiveNft.history)) {
            updateNFT(effectiveNft.id, { history: nftData.history }, true);
          }
        }
      },
      (error) => {
        console.warn("Error listening to NFT history:", error);
      }
    );
    return () => unsub();
  }, [activeTab, effectiveNft?.id, effectiveNft?.history]);

  const isAuction = useMemo(
    () => effectiveNft?.listingType === "auction",
    [effectiveNft]
  );

  const isAuctionEnded = useMemo(() => {
    if (!isAuction || !effectiveNft?.auctionEndTime) return false;
    return new Date(effectiveNft.auctionEndTime).getTime() <= Date.now();
  }, [isAuction, effectiveNft?.auctionEndTime]);

  const userOffer = useMemo(() => {
    if (!effectiveNft || !userAddress) return null;
    return effectiveNft.offers?.find((o) => o.offerer === userAddress) || null;
  }, [effectiveNft, userAddress]);

  const highestOfferPrice = useMemo(() => {
    if (!effectiveNft?.offers || effectiveNft.offers.length === 0) return 0;
    return effectiveNft.offers.reduce(
      (max, o) => Math.max(max, parseFloat(o.price)),
      0
    );
  }, [effectiveNft]);

  const matchedCreatorArtist = useMemo(() => {
    if (!effectiveNft) return null;
    return (
      artists.find(
        (a) =>
          a.uid === effectiveNft.artistId ||
          a.uid === effectiveNft.creatorId ||
          a.uid === effectiveNft.creator ||
          a.name.toLowerCase() === (effectiveNft.creator || "").toLowerCase()
      ) || null
    );
  }, [effectiveNft, artists]);

  const resolvedCreatorId =
    matchedCreatorArtist?.uid ||
    effectiveNft?.artistId ||
    effectiveNft?.creatorId ||
    effectiveNft?.creator?.toLowerCase().replace(/\s+/g, "-");

  const moreFromCreator = useMemo(() => {
    if (!effectiveNft) return [];
    return allNFTs
      .filter((n) => n.creator === effectiveNft.creator && n.id !== effectiveNft.id)
      .slice(0, 4);
  }, [effectiveNft, allNFTs]);

  const relatedNfts = useMemo(() => {
    if (!effectiveNft || !associatedTrack) return [];
    const relatedTrackIds = allTracks
      .filter((t) => t.genre === associatedTrack.genre)
      .map((t) => t.id);

    let filtered = allNFTs.filter(
      (n) => relatedTrackIds.includes(n.trackId) && n.id !== effectiveNft.id
    );

    if (relatedSort === "bids") {
      filtered = [...filtered].sort(
        (a, b) => (b.offers?.length || 0) - (a.offers?.length || 0)
      );
    }
    return filtered.slice(0, 4);
  }, [effectiveNft, associatedTrack, allTracks, allNFTs, relatedSort]);

  const handleTip = async (amount: number) => {
    if (!amount || amount <= 0 || isNaN(amount)) {
      addNotification("Enter a valid TON tip amount.", "warning");
      return;
    }

    setIsTipping(false);
    if (!tonConnectUI.connected) {
      addNotification("Connect your TON wallet to tip the artist.", "warning");
      tonConnectUI.openModal();
      return;
    }

    const creatorArtist = artists.find(
      (a) =>
        a.uid === effectiveNft?.artistId ||
        a.name?.toLowerCase() === effectiveNft?.creator?.toLowerCase()
    );
    const recipient =
      (effectiveNft as any)?.creatorAddress || creatorArtist?.walletAddress;

    if (!recipient) {
      addNotification("Creator has not connected a TON wallet yet.", "warning");
      return;
    }

    addNotification(`Sending ${amount} TON to ${effectiveNft?.creator}...`, "info");
    try {
      await sendTransactionSafe(tonConnectUI, {
        validUntil: Math.floor(Date.now() / 1000) + 120,
        messages: [
          {
            address: recipient,
            amount: BigInt(Math.round(amount * 1e9)).toString(),
          },
        ],
      });
      confetti({
        particleCount: 140,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#0088cc", "#ffffff", "#38bdf8"],
      });
      addNotification(
        `Successfully sent ${amount} TON tip to ${effectiveNft?.creator}!`,
        "success"
      );
    } catch (err: any) {
      console.error("Tip transaction failed:", err);
      addNotification(
        err?.message || "Tip transaction cancelled or failed.",
        "error"
      );
    }
  };

  if (!effectiveNft && (isResolvingNft || !hasCheckedRemote)) {
    return (
      <div className="min-h-screen bg-[var(--tj-color-bg-primary,#091220)] flex flex-col items-center justify-center text-white gap-3">
        <LoadingSpinner size={48} />
        <p className="text-xs font-semibold text-[var(--tj-color-text-secondary,#C2C7CD)]">
          Loading NFT details...
        </p>
      </div>
    );
  }

  if (!effectiveNft) {
    return (
      <div className="min-h-screen bg-[var(--tj-color-bg-primary,#091220)] flex items-center justify-center text-white px-6">
        <div className="text-center bg-[var(--tj-color-surface-default,#0D1628)] p-8 rounded-[var(--tj-radius-lg,10px)] max-w-sm w-full border-0">
          <h2 className="text-lg font-bold mb-2">NFT Not Found</h2>
          <p className="text-sm text-[var(--tj-color-text-secondary,#C2C7CD)] mb-6">
            The requested NFT edition could not be located.
          </p>
          <button
            type="button"
            onClick={() => navigate("/marketplace")}
            className="w-full py-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white text-xs font-bold uppercase tracking-wider border-0 cursor-pointer transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const handleAction = () => {
    if (isOwner) {
      if (effectiveNft.listingType) {
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

  const onConfirmAcceptance = () => {
    if (selectedOffer) {
      setOfferToAccept(selectedOffer);
      setSelectedOffer(null);
    }
  };

  const confirmAcceptOffer = async () => {
    if (!offerToAccept || !effectiveNft) return;

    addNotification(`Accepting offer from ${formatShortAddress(offerToAccept.offerer)}...`, "info");

    try {
      await updateNFT(effectiveNft.id, {
        owner: offerToAccept.offerer,
        listingType: undefined,
        price: offerToAccept.price,
        offers: [],
      });

      addNotification("Ownership transfer completed.", "success");
      setOfferToAccept(null);
      navigate("/profile");
    } catch (err) {
      console.error("Failed to accept offer:", err);
      addNotification("Failed to accept offer.", "error");
    }
  };

  const confirmDeclineOffer = () => {
    if (!effectiveNft || !offerToDecline) return;
    const newOffers =
      effectiveNft.offers?.filter((o) => o.offerer !== offerToDecline) || [];
    updateNFT(effectiveNft.id, { offers: newOffers });
    addNotification("Offer declined.", "info");
    setOfferToDecline(null);
  };

  const handleCancelListing = () => {
    setIsCancelListingConfirmOpen(true);
  };

  const confirmCancelListing = async () => {
    if (!effectiveNft) return;
    addNotification("Cancelling marketplace listing...", "info");

    try {
      const listing = await getActiveListingForNFT(effectiveNft.id);
      if (!listing) {
        updateNFT(effectiveNft.id, { listingType: undefined });
        addNotification("Listing cleared.", "success");
        return;
      }

      await cancelListing(tonConnectUI, listing, effectiveNft);
      updateNFT(effectiveNft.id, { listingType: undefined });
      addNotification("Listing cancelled successfully.", "success");
    } catch (e) {
      console.error(e);
      addNotification("Could not cancel listing.", "error");
    } finally {
      setIsCancelListingConfirmOpen(false);
    }
  };

  const handleCancelBid = () => {
    setIsCancelBidConfirmOpen(true);
  };

  const confirmCancelBid = async () => {
    if (!effectiveNft || !userAddress) return;
    addNotification("Withdrawing bid...", "info");

    try {
      const newOffers =
        effectiveNft.offers?.filter((o) => o.offerer !== userAddress) || [];
      await updateNFT(effectiveNft.id, { offers: newOffers });
      addNotification("Bid withdrawn.", "success");
      setIsCancelBidConfirmOpen(false);
    } catch (err) {
      console.error("Failed to withdraw bid:", err);
      addNotification("Failed to withdraw bid.", "error");
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const visibleTabs = [
    "details",
    "activity",
    "offers",
    "comments",
    ...((isOwner || hasAccess) && effectiveNft.exclusiveContent?.length
      ? ["exclusive"]
      : []),
    ...(isOwner ? ["collection"] : []),
  ] as const;

  const rarityTier =
    (effectiveNft.supply || 100) <= 25
      ? { label: "Legendary", color: "text-amber-400 bg-amber-500/15" }
      : (effectiveNft.supply || 100) <= 100
      ? { label: "Rare", color: "text-purple-400 bg-purple-500/15" }
      : { label: "Standard", color: "text-emerald-400 bg-emerald-500/15" };

  const isFavourited = likedTrackIds.includes(effectiveNft.trackId || effectiveNft.id);

  return (
    <div className="relative min-h-screen pb-24 bg-[var(--tj-color-bg-primary,#091220)] overflow-x-hidden text-white">
      {/* Subtle Ambient Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[900px] h-[620px] rounded-full blur-[150px] transition-all duration-1000"
          style={{ backgroundColor: primaryColor, opacity: 0.08 }}
        />
        <div
          className="absolute top-1/3 -right-24 w-[600px] h-[600px] rounded-full blur-[160px] transition-all duration-1000"
          style={{ backgroundColor: secondaryColor, opacity: 0.06 }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-1000"
          style={{ backgroundColor: accentColor, opacity: 0.06 }}
        />
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{ background: radialGradient }}
        />
      </div>

      <PageHeader
        title="NFT Details"
        showBack={true}
        rightContent={
          <div className="flex items-center gap-1">
            {toggleLikeTrack && (
              <button
                type="button"
                onClick={() => toggleLikeTrack(effectiveNft.trackId || effectiveNft.id)}
                className="min-w-[40px] min-h-[40px] p-2 rounded-[var(--tj-radius-xs,4px)] text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-0 outline-none"
                title={isFavourited ? "Remove from Favorites" : "Add to Favorites"}
                aria-label={isFavourited ? "Remove from Favorites" : "Add to Favorites"}
              >
                <AnimatedHeart
                  liked={Boolean(isFavourited)}
                  className={cn(
                    "w-5 h-5",
                    isFavourited ? "fill-rose-400 text-rose-400" : ""
                  )}
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPriceAlertModal(true)}
              className="min-w-[40px] min-h-[40px] p-2 rounded-[var(--tj-radius-xs,4px)] text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-0 outline-none"
              title="Set Price Alert"
              aria-label="Set Price Alert"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="min-w-[40px] min-h-[40px] p-2 rounded-[var(--tj-radius-xs,4px)] text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-0 outline-none"
              title="Share NFT"
              aria-label="Share NFT"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="relative z-10 w-full max-w-full px-2 pt-3">
        {/* Hero */}
        <NFTDetailHero
          nft={effectiveNft}
          associatedTrack={associatedTrack}
          isAuction={isAuction}
          highestOfferPrice={highestOfferPrice}
          onShare={handleShare}
          isOwner={isOwner}
        />

        {/* Market Action Card */}
        <div className="mt-6 mb-6">
          <NFTPriceCard
            nft={effectiveNft}
            isAuction={isAuction}
            isAuctionEnded={isAuctionEnded}
            highestOfferPrice={highestOfferPrice}
            isOwner={isOwner}
            isPlacingBid={isPlacingBid}
            userOffer={userOffer}
            onAction={handleAction}
            onOffer={() => setShowOfferModal(true)}
            onCancelListing={handleCancelListing}
            onCancelBid={handleCancelBid}
            onStake={() => setShowStakeModal(true)}
            onTip={() => setIsTipping(true)}
            onPriceAlert={() => setShowPriceAlertModal(true)}
            onShare={handleShare}
            onManage={() => setShowManageModal(true)}
            onSell={() => setShowListModal(true)}
            onSend={() => setShowSendModal(true)}
            priceAlertEnabled={priceAlertEnabled}
            priceAlertPercent={priceAlertPercent}
            onTogglePriceAlert={handleTogglePriceAlert}
            onPercentChange={handlePercentChange}
          />
        </div>

        {/* Borderless Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-md,8px)] mb-5 overflow-x-auto no-scrollbar">
          {visibleTabs.map((tab) => {
            const label =
              tab === "exclusive"
                ? "Holder Perks"
                : tab === "offers"
                ? `Offers (${effectiveNft.offers?.length || 0})`
                : tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-3.5 py-2 rounded-[var(--tj-radius-sm,6px)] text-xs font-bold whitespace-nowrap transition-colors border-0 cursor-pointer",
                  activeTab === tab
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-transparent text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white hover:bg-[var(--tj-color-surface-elevated,#111F36)]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        <div className="min-h-[340px]">
          <AnimatePresence mode="wait">
            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {metadataError && (
                  <div className="col-span-full p-4 bg-rose-500/10 border-0 rounded-[var(--tj-radius-md,8px)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--tj-radius-sm,6px)] bg-rose-500/20 flex items-center justify-center shrink-0">
                        <X className="h-5 w-5 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-400">
                          Metadata sync failed
                        </p>
                        <p className="text-xs text-slate-300">{metadataError}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={loadMetadata}
                      className="px-4 py-2 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white rounded-[var(--tj-radius-sm,6px)] text-xs font-bold transition-colors border-0 cursor-pointer shrink-0"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {effectiveNft.description && (
                  <div className="col-span-full p-5 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-md,8px)]">
                    <h4 className="text-xs font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider mb-2">
                      About This Release
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {effectiveNft.description}
                    </p>
                  </div>
                )}

                {(effectiveNft.traits || dynamicMetadata?.traits) && (
                  <div className="col-span-full space-y-2.5">
                    <h4 className="text-xs font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider px-1">
                      Edition Traits
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {(effectiveNft.traits || dynamicMetadata!.traits!).map((trait) => (
                        <div
                          key={trait.trait_type}
                          className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 p-3.5 rounded-[var(--tj-radius-sm,6px)]"
                        >
                          <span className="text-[11px] font-medium text-[var(--tj-color-text-secondary,#C2C7CD)] block mb-1">
                            {trait.trait_type}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {trait.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scarcity & Rarity Row */}
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 p-5 rounded-[var(--tj-radius-md,8px)] relative overflow-hidden">
                    <span className="text-xs font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider block mb-2">
                      Edition Scarcity
                    </span>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-3xl font-black font-mono tabular-nums text-amber-400 leading-none">
                        {effectiveNft.supply
                          ? ((1 / effectiveNft.supply) * 100).toFixed(2)
                          : "100.00"}
                        %
                      </span>
                      <span className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] font-medium pb-0.5">
                        of total supply
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[var(--tj-color-text-secondary,#C2C7CD)]">Edition</span>
                        <span className="text-white font-bold">
                          #{effectiveNft.edition} / {effectiveNft.supply || 1}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-xs,4px)] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              100,
                              Math.max(4, (1 / (effectiveNft.supply || 1)) * 100)
                            )}%`,
                          }}
                          className="h-full bg-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 p-5 rounded-[var(--tj-radius-md,8px)] flex flex-col justify-between gap-3">
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider block">
                        Rarity Tier
                      </span>
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-[var(--tj-radius-xs,4px)] text-xs font-bold uppercase tracking-wider",
                          rarityTier.color
                        )}
                      >
                        {rarityTier.label}
                      </span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Total editions:{" "}
                        <span className="font-mono font-bold text-white">
                          {effectiveNft.supply || 1}
                        </span>{" "}
                        on TON blockchain.
                      </p>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Verified edition supply
                    </p>
                  </div>
                </div>

                {/* Royalty Distribution */}
                <div className="col-span-full md:col-span-2">
                  <div className="p-5 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-md,8px)] h-full">
                    <h4 className="text-xs font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider mb-4">
                      Creator Royalty Information
                    </h4>
                    <div className="space-y-3.5">
                      {effectiveNft.royaltySplits && effectiveNft.royaltySplits.length > 0 ? (
                        effectiveNft.royaltySplits.map((split, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-white">
                                {split.label || "Creator Split"}
                              </span>
                              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                                {split.percentage <= 1
                                  ? `${(split.percentage * 100).toFixed(0)}%`
                                  : `${split.percentage}%`}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-xs,4px)] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${
                                    split.percentage <= 1
                                      ? split.percentage * 100
                                      : split.percentage
                                  }%`,
                                }}
                                className="h-full bg-emerald-400"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3.5 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] border-0 text-xs font-semibold text-slate-200 flex items-center justify-between">
                          <span>Creator Resale Royalty</span>
                          <span className="font-mono text-[var(--tj-color-brand-primary,#00B4D8)]">
                            {typeof (effectiveNft as any).royalty === "number" &&
                            (effectiveNft as any).royalty > 0
                              ? `${(effectiveNft as any).royalty}%`
                              : "Not specified"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Provenance, Owner, Collection, Network & TonScan */}
                <div className="col-span-full md:col-span-1 space-y-4">
                  <div className="p-5 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-md,8px)] space-y-3">
                    <h4 className="text-xs font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
                      On-Chain Details
                    </h4>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[var(--tj-color-text-secondary,#C2C7CD)] block">Collection</span>
                        <span className="text-sm font-bold text-white">
                          {collections?.find(
                            (c) =>
                              c.id === (effectiveNft as any).collectionId ||
                              (Array.isArray(c.nftIds) && c.nftIds.includes(effectiveNft.id))
                          )?.name ||
                            (effectiveNft as any).collectionName ||
                            "Single Release"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--tj-color-text-secondary,#C2C7CD)] block">Blockchain Network</span>
                        <span className="text-sm font-bold text-[var(--tj-color-brand-primary,#00B4D8)]">
                          {TON_NETWORK_MODE === "testnet" ? "TON Testnet" : "TON Mainnet"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--tj-color-text-secondary,#C2C7CD)] block">Token Standard</span>
                        <span className="text-sm font-bold text-white">
                          TEP-62 Music NFT
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--tj-color-text-secondary,#C2C7CD)] block">Owner Address</span>
                        <span className="text-xs font-mono text-slate-200 break-all">
                          {effectiveNft.owner || "Unassigned"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--tj-color-text-secondary,#C2C7CD)] block">Minted Date</span>
                        <span className="text-sm font-bold font-mono text-white">
                          {effectiveNft.createdAt
                            ? new Date(effectiveNft.createdAt).toLocaleDateString()
                            : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {effectiveNft.contractAddress && (
                    <div className="p-5 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-md,8px)] flex flex-col items-center text-center space-y-3">
                      <h4 className="text-xs font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider w-full text-left">
                        Contract Address
                      </h4>
                      <div className="p-2 bg-white rounded-[var(--tj-radius-xs,4px)]">
                        <QRCodeSVG
                          value={getTonScanUrl(effectiveNft.contractAddress, false, TON_NETWORK_MODE)}
                          size={112}
                          bgColor="#ffffff"
                          fgColor="#0B0F17"
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-between bg-[var(--tj-color-surface-elevated,#111F36)] border-0 rounded-[var(--tj-radius-sm,6px)] px-3 py-2 font-mono text-xs text-slate-300">
                          <span className="truncate">{effectiveNft.contractAddress}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(effectiveNft.contractAddress!);
                              setCopiedAddress(true);
                              setTimeout(() => setCopiedAddress(false), 2000);
                            }}
                            className="ml-2 text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white transition-colors bg-transparent border-0 cursor-pointer shrink-0"
                            title="Copy Contract Address"
                            aria-label="Copy contract address"
                          >
                            {copiedAddress ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <a
                          href={getTonScanUrl(effectiveNft.contractAddress, false, TON_NETWORK_MODE)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-white transition-colors"
                        >
                          View on TonScan <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {isAuction && (
                  <div className="col-span-full p-5 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-md,8px)] space-y-4">
                    <h4 className="text-xs font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
                      Active Auction Bids
                    </h4>
                    <RecentBidsList
                      offers={effectiveNft.offers}
                      highestOfferPrice={highestOfferPrice}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "activity" && (
              <NFTActivity
                nft={effectiveNft}
                salesData={salesData}
                isAuction={isAuction}
                highestOfferPrice={highestOfferPrice}
              />
            )}

            {activeTab === "offers" && (
              <motion.div
                key="offers"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5 max-h-[420px] overflow-y-auto no-scrollbar"
              >
                {effectiveNft.offers && effectiveNft.offers.length > 0 ? (
                  effectiveNft.offers.map((o) => {
                    const isTopBid = parseFloat(o.price) === highestOfferPrice;
                    return (
                      <div
                        key={o.id}
                        className={cn(
                          "p-3.5 rounded-[var(--tj-radius-md,8px)] border-0 flex items-center justify-between gap-3 transition-colors",
                          isTopBid ? "bg-[var(--tj-color-surface-elevated,#111F36)]" : "bg-[var(--tj-color-surface-default,#0D1628)]"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={getPlaceholderImage(o.offerer || o.id, 100, 100)}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-[var(--tj-radius-sm,6px)] object-cover shrink-0"
                            alt={formatShortAddress(o.offerer)}
                          />
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-white font-mono truncate block">
                              {formatShortAddress(o.offerer)}
                            </span>
                            {isTopBid && (
                              <span className="text-[10px] font-bold text-[var(--tj-color-brand-primary,#00B4D8)] uppercase tracking-wider">
                                Highest Offer
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-black font-mono tabular-nums text-white">
                            {o.price} TON
                          </span>
                          {isOwner && (
                            <div className="flex items-center gap-1.5 ml-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOffer(o)}
                                className="px-3 py-1.5 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white text-xs font-bold border-0 cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => setOfferToDecline(o.offerer)}
                                className="px-2.5 py-1.5 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs font-bold border-0 cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] text-[var(--tj-color-text-secondary,#C2C7CD)] text-xs font-semibold uppercase tracking-wider">
                    No offers submitted yet
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "comments" && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <CommentsSection
                  targetId={effectiveNft.id}
                  targetType="nft"
                  itemOwnerAddress={effectiveNft.owner}
                  creatorAddress={effectiveNft.creator}
                />
              </motion.div>
            )}

            {activeTab === "collection" && isOwner && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {allNFTs
                  .filter(
                    (n) =>
                      n.owner === (userAddress || userProfile?.walletAddress) ||
                      (userProfile?.uid && n.owner === userProfile.uid)
                  )
                  .map((nft) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
              </motion.div>
            )}

            {activeTab === "exclusive" && (
              <motion.div
                key="exclusive"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {isOwner || hasAccess ? (
                  <div className="p-6 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-lg,10px)] space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-elevated,#111F36)] flex items-center justify-center shrink-0">
                        <Crown className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Holder Exclusive Downloads
                        </h3>
                        <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)]">
                          Verified access granted for your collection
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {effectiveNft.exclusiveContent?.map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-md,8px)] transition-colors group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-default,#0D1628)] flex items-center justify-center text-[var(--tj-color-brand-primary,#00B4D8)]">
                              {item.type === "video" && <Video className="h-5 w-5" />}
                              {item.type === "track" && <MusicIcon className="h-5 w-5" />}
                              {item.type === "image" && <ImageIcon className="h-5 w-5" />}
                              {item.type === "document" && (
                                <FileText className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">
                                {item.title}
                              </p>
                              <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase font-mono">
                                {item.type}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-[var(--tj-color-text-secondary,#C2C7CD)] group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-[var(--tj-color-surface-default,#0D1628)] border-0 rounded-[var(--tj-radius-lg,10px)] flex flex-col items-center justify-center text-center space-y-3">
                    <Lock className="h-10 w-10 text-[var(--tj-color-text-secondary,#C2C7CD)]" />
                    <h3 className="text-base font-bold text-white">
                      Holder Access Only
                    </h3>
                    <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] max-w-xs">
                      Own this NFT edition to unlock high-resolution stems and bonus downloads.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Artist Spotlight */}
        <NFTArtistSpotlight
          nft={effectiveNft}
          matchedCreator={matchedCreatorArtist}
          associatedTrack={associatedTrack}
        />

        {/* More from Creator */}
        {moreFromCreator.length > 0 && (
          <section className="mt-10 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  More from {effectiveNft.creator}
                </h2>
                <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)]">
                  Other releases by this artist
                </p>
              </div>
              {resolvedCreatorId && (
                <button
                  type="button"
                  onClick={() => navigate(`/artist/${resolvedCreatorId}`)}
                  className="px-4 py-2 bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-sm,6px)] text-xs font-bold text-white transition-colors flex items-center gap-1.5 border-0 cursor-pointer"
                >
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {moreFromCreator.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </section>
        )}

        {/* Related NFTs */}
        {relatedNfts.length > 0 && (
          <section className="mt-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Related {associatedTrack?.genre} NFTs
                </h2>
                <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)]">
                  Similar sonic collectibles
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-[var(--tj-color-surface-default,#0D1628)] rounded-[var(--tj-radius-sm,6px)] p-1 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRelatedSort("default")}
                    className={cn(
                      "px-3 py-1.5 rounded-[var(--tj-radius-xs,4px)] text-xs font-bold transition-colors border-0 cursor-pointer",
                      relatedSort === "default"
                        ? "bg-[var(--tj-color-surface-elevated,#111F36)] text-white"
                        : "bg-transparent text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white"
                    )}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelatedSort("bids")}
                    className={cn(
                      "px-3 py-1.5 rounded-[var(--tj-radius-xs,4px)] text-xs font-bold transition-colors border-0 cursor-pointer flex items-center gap-1",
                      relatedSort === "bids"
                        ? "bg-[var(--tj-color-surface-elevated,#111F36)] text-white"
                        : "bg-transparent text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white"
                    )}
                  >
                    <ArrowUpDown className="h-3 w-3" /> Most Bids
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/explore/nfts?title=Related Vibes")}
                  className="px-4 py-2 bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-sm,6px)] text-xs font-bold text-white transition-colors flex items-center gap-1.5 border-0 cursor-pointer"
                >
                  Explore Genre <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedNfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Tip Artist Modal (TON) */}
      <AnimatePresence>
        {isTipping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsTipping(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[var(--tj-color-surface-default,#0D1628)] rounded-[var(--tj-radius-lg,10px)] p-6 shadow-xl space-y-5 border-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] flex items-center justify-center">
                    <Coins className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Tip {effectiveNft.creator}
                    </h3>
                    <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)]">
                      Send direct TON support to the creator
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTipping(false)}
                  className="p-2 rounded-full bg-[var(--tj-color-surface-elevated,#111F36)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white border-0 cursor-pointer"
                  aria-label="Close tip dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {["0.5", "1", "2", "5"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomTipAmount(preset)}
                    className={cn(
                      "py-2.5 rounded-[var(--tj-radius-sm,6px)] font-mono text-xs font-bold transition-colors border-0 cursor-pointer",
                      customTipAmount === preset
                        ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                        : "bg-[var(--tj-color-surface-elevated,#111F36)] text-slate-300 hover:text-white"
                    )}
                  >
                    {preset} TON
                  </button>
                ))}
              </div>

              <div className="bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-md,8px)] p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <img src={TON_LOGO} className="w-5 h-5" alt="TON" />
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={customTipAmount}
                    onChange={(e) => setCustomTipAmount(e.target.value)}
                    className="w-full bg-transparent text-base font-mono font-bold text-white outline-none border-0"
                    placeholder="1.0"
                    aria-label="Tip amount in TON"
                  />
                </div>
                {typeof tonUsdRate === "number" && tonUsdRate > 0 && (
                  <span className="text-xs font-mono text-[var(--tj-color-text-secondary,#C2C7CD)] shrink-0">
                    ≈ ${((parseFloat(customTipAmount) || 0) * tonUsdRate).toFixed(2)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleTip(parseFloat(customTipAmount))}
                className="w-full py-3.5 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white text-xs font-bold uppercase tracking-wider transition-colors border-0 cursor-pointer"
              >
                Send {customTipAmount || "0"} TON Tip
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showBuyModal && (
        <BuyNFTModal nft={effectiveNft} onClose={() => setShowBuyModal(false)} />
      )}
      {showOfferModal && (
        <PlaceOfferModal nft={effectiveNft} onClose={() => setShowOfferModal(false)} />
      )}
      {showListModal && (
        <SellNFTModal nft={effectiveNft} onClose={() => setShowListModal(false)} />
      )}
      {showBidModal && (
        <BidNFTModal
          nft={effectiveNft}
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
        />
      )}
      {showSendModal && (
        <SendNFTModal
          nft={effectiveNft}
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
        />
      )}
      {showStakeModal && effectiveNft && (
        <StakeNFTModal
          nft={effectiveNft}
          onClose={() => setShowStakeModal(false)}
        />
      )}
      {showManageModal && (
        <ManageNFTModal
          nft={effectiveNft}
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
        />
      )}
      {selectedOffer && (
        <BidAcceptanceModal
          nft={effectiveNft}
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onAccept={onConfirmAcceptance}
        />
      )}
      {showShareModal && effectiveNft && (
        <ShareNFTDialog
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          nft={effectiveNft}
        />
      )}
      {showReportModal && effectiveNft && (
        <ReportNFTModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          nft={effectiveNft}
          userAddress={userAddress || userProfile?.walletAddress || "anonymous"}
        />
      )}
      {showPriceAlertModal && effectiveNft && (
        <PriceAlertModal
          isOpen={showPriceAlertModal}
          onClose={() => setShowPriceAlertModal(false)}
          nft={effectiveNft}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isCancelListingConfirmOpen}
        onClose={() => setIsCancelListingConfirmOpen(false)}
        onConfirm={confirmCancelListing}
        title="Cancel Listing?"
        description="Are you sure you want to remove this NFT from sale?"
        confirmText="Cancel Listing"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={!!offerToDecline}
        onClose={() => setOfferToDecline(null)}
        onConfirm={confirmDeclineOffer}
        title="Decline Offer?"
        description={`Decline offer from ${formatShortAddress(offerToDecline || undefined)}?`}
        confirmText="Decline Offer"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={!!offerToAccept}
        onClose={() => setOfferToAccept(null)}
        onConfirm={confirmAcceptOffer}
        title="Accept Offer?"
        description="Confirm transfer of ownership to the selected collector."
        confirmText="Confirm Sale"
        assetName={effectiveNft.title}
        assetImage={effectiveNft.imageUrl || getPlaceholderImage(`nft-${effectiveNft.id}`)}
        tonAmount={offerToAccept?.price}
        networkFee="0.05"
        totalAmount={(parseFloat(offerToAccept?.price || "0") + 0.05).toFixed(2)}
        fromAddress={offerToAccept?.offerer}
        recipient={userAddress}
        transactionType="Offer Acceptance"
      />

      <ConfirmationModal
        isOpen={isCancelBidConfirmOpen}
        onClose={() => setIsCancelBidConfirmOpen(false)}
        onConfirm={confirmCancelBid}
        title="Withdraw Bid?"
        description={`Are you sure you want to withdraw your bid on "${effectiveNft.title}"?`}
        confirmText="Withdraw Bid"
        variant="destructive"
      />
    </div>
  );
};

export default NFTDetail;
