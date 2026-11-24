import { useState, useEffect, useMemo, useCallback } from "react";
import { Artist, UserProfile } from "@/types";
import {
  MarketplaceNFT,
  MarketplaceTab,
  NFTCollection,
  LiveAuction,
  LeaderboardUser,
  RecentSale,
  GenreCategory,
  MarketplaceStats,
  AuctionStatus,
  PriceRangeFilter,
  EditionTypeFilter,
  NetworkFilter,
} from "../types";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { TON_NETWORK_MODE } from "@/services/tonService";
import {
  collection,
  query,
  limit,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useOptionalWallet } from "@/contexts/WalletContext";
import { useAudio } from "@/contexts/AudioContext";

export const DEFAULT_GENRES: string[] = [
  "Electronic",
  "Hip-Hop",
  "Pop",
  "R&B",
  "Rock",
  "Jazz",
  "Ambient",
  "Indie",
  "Afrobeats",
  "Classical",
];

const GENRE_COLOR_CLASSES: Record<string, string> = {
  Electronic: "from-cyan-600 to-blue-950",
  "Hip-Hop": "from-blue-600 to-indigo-950",
  Pop: "from-emerald-600 to-teal-950",
  "R&B": "from-rose-600 to-red-950",
  Rock: "from-slate-600 to-zinc-900",
  Jazz: "from-indigo-600 to-slate-950",
  Ambient: "from-teal-600 to-cyan-950",
  Indie: "from-violet-600 to-slate-900",
  Afrobeats: "from-amber-600 to-yellow-900",
  Classical: "from-sky-700 to-slate-900",
};

const PAGE_STEP = 12;

function parseTonValue(val?: string | number | null): number {
  if (val === undefined || val === null) return 0;
  const num = parseFloat(String(val).replace(/[^\d.]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function resolveAuctionStatus(nft: MarketplaceNFT, nowMs: number): AuctionStatus {
  const rawStatus = String(nft.listingStatus || (nft as any).auctionStatus || "").toLowerCase();
  if (rawStatus === "cancelled" || rawStatus === "canceled") return "cancelled";

  if (nft.auctionStartTime) {
    const startMs = new Date(nft.auctionStartTime).getTime();
    if (Number.isFinite(startMs) && startMs > nowMs) {
      return "pending";
    }
  }

  if (nft.auctionEndTime) {
    const endMs = new Date(nft.auctionEndTime).getTime();
    if (Number.isFinite(endMs) && endMs <= nowMs) {
      return "ended";
    }
  }

  if (rawStatus === "ended" || rawStatus === "sold") return "ended";
  if (rawStatus === "pending" || rawStatus === "scheduled") return "pending";
  return "active";
}

export const useMarketplace = () => {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("discover");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All NFTs");
  const [activeGenre, setActiveGenre] = useState("All");
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>("all");
  const [editionType, setEditionType] = useState<EditionTypeFilter>("all");
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>("all");
  const [sortBy, setSortBy] = useState("default");
  const [pageSize, setPageSize] = useState(PAGE_STEP);
  const [reloadNonce, setReloadNonce] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  const [firestoreNFTs, setFirestoreNFTs] = useState<MarketplaceNFT[]>([]);
  const [firestoreCollections, setFirestoreCollections] = useState<NFTCollection[]>([]);
  const [verifiedArtists, setVerifiedArtists] = useState<LeaderboardUser[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [collectionNFTCounts, setCollectionNFTCounts] = useState<Record<string, number>>({});

  const wallet = useOptionalWallet();
  const audio = useAudio();

  const walletAddress = wallet?.address || "";
  const isWalletConnected = Boolean(wallet?.isConnected || walletAddress);
  const tonBalance = wallet?.tonBalance ?? 0;
  const walletNetwork = wallet?.network || "mainnet";
  const connectWallet = useCallback(() => {
    wallet?.connectWallet?.();
  }, [wallet]);
  const disconnectWallet = useCallback(async () => {
    await wallet?.disconnectWallet?.();
  }, [wallet]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageSize(PAGE_STEP);
    }, 220);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset visible pagination when category / genre / secondary filters / sort change
  useEffect(() => {
    setPageSize(PAGE_STEP);
  }, [activeCategory, activeGenre, priceRange, editionType, networkFilter, sortBy, activeTab]);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Subscribe to real Firestore NFTs, collections, verified artists, and sales
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const nftsQuery = query(collection(db, "nfts"), limit(120));
    const unsubscribeNFTs = onSnapshot(
      nftsQuery,
      (snapshot) => {
        const loaded: MarketplaceNFT[] = [];
        const counts: Record<string, number> = {};

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const rawPrice =
            data.price !== undefined && data.price !== null ? String(data.price) : "0 TON";
          const formattedPrice = rawPrice.includes("TON") ? rawPrice : `${rawPrice} TON`;
          const colId = data.collectionId || data.albumId || "";
          if (colId) {
            counts[colId] = (counts[colId] || 0) + 1;
          }

          loaded.push({
            id: docSnap.id,
            trackId: data.trackId || docSnap.id,
            title: data.title || "Untitled NFT",
            artist: data.artist || data.creator || "Unknown Artist",
            artistId: data.artistId || data.creatorId || "",
            owner: data.owner || data.ownerAddress || "",
            ownerId: data.ownerId || "",
            creator: data.creator || data.artist || "Unknown Artist",
            creatorId: data.creatorId || data.artistId || "",
            creatorUsername: data.creatorUsername || data.username || data.handle || "",
            imageUrl: data.imageUrl || data.coverUrl || "",
            coverUrl: data.coverUrl || data.imageUrl || "",
            audioUrl: data.audioUrl || data.mediaUrl || "",
            price: formattedPrice,
            listingType: data.listingType || (data.price ? "fixed" : undefined),
            listingStatus: data.listingStatus || data.status || "",
            contractAddress: data.contractAddress || "",
            isNFT: true,
            artistVerified: Boolean(data.artistVerified),
            edition: data.edition || "1/1",
            editionNumber: Number(data.editionNumber || 1),
            totalEditions: Number(data.totalEditions || data.supply || 1),
            remainingEditions:
              data.remainingEditions !== undefined
                ? Number(data.remainingEditions)
                : Number(data.totalEditions || data.supply || 1),
            supply: Number(data.supply || data.totalEditions || 1),
            network: String(data.network || data.chain || TON_NETWORK_MODE).toLowerCase(),
            rarity: data.rarity || "Common",
            genre: data.genre || "",
            description: data.description || "",
            royalty: Number(data.royalty ?? data.royaltyPercentage ?? 0),
            royaltySplits: Array.isArray(data.royaltySplits) ? data.royaltySplits : [],
            isFeatured: Boolean(data.isFeatured || data.featured),
            playCount: Number(data.playCount || 0),
            likes: Number(data.likes || 0),
            highestBidder: data.highestBidder || "",
            currentBid: data.currentBid ? String(data.currentBid) : formattedPrice,
            auctionStartTime: data.auctionStartTime || data.startsAt || "",
            auctionEndTime: data.auctionEndTime || data.endsAt || "",
            bidsCount: Number(
              data.bidsCount ||
                (Array.isArray(data.bids)
                  ? data.bids.length
                  : Array.isArray(data.offers)
                  ? data.offers.length
                  : 0)
            ),
            offers: Array.isArray(data.offers) ? data.offers : [],
            watchers: Number(data.watchers || 0),
            collectionId: colId,
            collectionName: data.collectionName || data.albumTitle || "",
            stakedOwnerAddress: data.stakedOwnerAddress || "",
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString()
              : data.createdAt || "",
          });
        });

        setFirestoreNFTs(loaded);
        setCollectionNFTCounts((prev) => ({ ...prev, ...counts }));
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "nfts");
        setError("Unable to load NFT listings from Firebase right now.");
        setIsLoading(false);
      }
    );

    const colQuery = query(collection(db, "collections"), limit(60));
    const unsubscribeCols = onSnapshot(
      colQuery,
      (snapshot) => {
        const cols: NFTCollection[] = [];
        const colCounts: Record<string, number> = {};

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const total =
            data.totalNFTs ||
            data.itemsCount ||
            data.itemCount ||
            (Array.isArray(data.nftIds) ? data.nftIds.length : 0);
          if (total) {
            colCounts[docSnap.id] = total;
          }

          const floorRaw = data.floorPrice;
          const volRaw = data.volume;

          cols.push({
            id: docSnap.id,
            name: data.name || "Untitled Collection",
            creator: data.creatorName || data.creator || "TonJam Creator",
            creatorId: data.creatorId || data.artistId || "",
            volume:
              volRaw !== undefined && volRaw !== null && Number(volRaw) > 0
                ? String(volRaw)
                : undefined,
            owners: Number(data.ownersCount || data.owners || 0),
            floorPrice:
              floorRaw !== undefined && floorRaw !== null && Number(floorRaw) > 0
                ? String(floorRaw)
                : undefined,
            imageUrl: data.imageUrl || data.coverUrl || "",
            itemCount: Number(total || 0),
            verified: Boolean(data.verified ?? data.creatorVerified ?? false),
            description: data.description || "",
          });
        });

        setFirestoreCollections(cols);
        setCollectionNFTCounts((prev) => ({ ...colCounts, ...prev }));
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "collections");
      }
    );

    const artistsQuery = query(
      collection(db, "users"),
      where("isVerifiedArtist", "==", true),
      limit(40)
    );
    const unsubscribeArtists = onSnapshot(
      artistsQuery,
      (snapshot) => {
        const loadedArtists: LeaderboardUser[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Artist & UserProfile;
          return {
            id: docSnap.id,
            name: data.name || "Artist",
            username: (data as any).username || (data as any).handle || "",
            avatar: (data as any).avatarUrl || (data as any).avatar || "",
            isVerified: Boolean(data.isVerifiedArtist || data.isVerified),
            salesCount: Number((data as any).salesCount || 0),
            revenueTON: String((data as any).revenueTON || (data as any).earnings || "0"),
            followersCount: Number(data.followers || (data as any).followersCount || 0),
          };
        });
        setVerifiedArtists(loadedArtists);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "users");
      }
    );

    const salesQuery = query(
      collection(db, "nftSales"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribeSales = onSnapshot(
      salesQuery,
      (snapshot) => {
        const sales: RecentSale[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const ts = data.timestamp?.toDate
            ? data.timestamp.toDate().toLocaleDateString()
            : String(data.timestamp || "");
          return {
            id: docSnap.id,
            nftId: data.nftId || "",
            nftTitle: data.nftTitle || data.title || "Music NFT",
            nftCoverUrl: data.nftCoverUrl || data.coverUrl || data.imageUrl || "",
            buyerName: data.buyerName || "Collector",
            buyerAddress: data.buyerAddress || "",
            sellerName: data.sellerName || data.artistName || "Creator",
            sellerAddress: data.sellerAddress || "",
            price: data.price
              ? String(data.price).includes("TON")
                ? String(data.price)
                : `${data.price} TON`
              : "0 TON",
            timestamp: ts,
          };
        });
        setRecentSales(sales);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "nftSales");
      }
    );

    return () => {
      unsubscribeNFTs();
      unsubscribeCols();
      unsubscribeArtists();
      unsubscribeSales();
    };
  }, [reloadNonce]);

  const retryLoad = useCallback(() => {
    setReloadNonce((n) => n + 1);
  }, []);

  // Join collection names, verified status, track genre, and creator username cleanly
  const allNFTs = useMemo<MarketplaceNFT[]>(() => {
    const collectionMap = new Map<string, NFTCollection>();
    firestoreCollections.forEach((c) => collectionMap.set(c.id, c));

    const artistMap = new Map<string, LeaderboardUser>();
    verifiedArtists.forEach((a) => {
      artistMap.set(a.id, a);
      if (a.name) artistMap.set(a.name.toLowerCase(), a);
    });

    const trackMap = new Map<string, (typeof audio.allTracks)[number]>();
    (audio.allTracks || []).forEach((t) => trackMap.set(t.id, t));

    return firestoreNFTs.map((nft) => {
      const col = nft.collectionId ? collectionMap.get(nft.collectionId) : undefined;
      const verifiedArtist =
        (nft.artistId && artistMap.get(nft.artistId)) ||
        (nft.creatorId && artistMap.get(nft.creatorId)) ||
        (nft.artist && artistMap.get(nft.artist.toLowerCase())) ||
        (nft.creator && artistMap.get(nft.creator.toLowerCase()));
      const matchedTrack = nft.trackId ? trackMap.get(nft.trackId) : undefined;

      return {
        ...nft,
        collectionName: nft.collectionName || col?.name || "",
        genre: nft.genre || matchedTrack?.genre || "",
        artistVerified: Boolean(nft.artistVerified || verifiedArtist?.isVerified),
        creatorUsername: nft.creatorUsername || verifiedArtist?.username || "",
        playCount: nft.playCount || matchedTrack?.playCount || 0,
        likes: nft.likes || matchedTrack?.likes || 0,
      };
    });
  }, [firestoreNFTs, firestoreCollections, verifiedArtists, audio.allTracks]);

  // Dynamic globally inclusive genre options from default set + backend genres
  const availableGenres = useMemo<string[]>(() => {
    const seen = new Set<string>(DEFAULT_GENRES.map((g) => g.toLowerCase()));
    const result = [...DEFAULT_GENRES];

    allNFTs.forEach((nft) => {
      const g = (nft.genre || "").trim();
      if (g && !seen.has(g.toLowerCase())) {
        seen.add(g.toLowerCase());
        result.push(g);
      }
    });

    return result;
  }, [allNFTs]);

  // Filter based on search term (title, artist, collection, genre, creator username, listing status), category pills, genre filter, and sort
  const filteredNFTs = useMemo(() => {
    let result = [...allNFTs];

    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.artist || "").toLowerCase().includes(q) ||
          (t.creator || "").toLowerCase().includes(q) ||
          (t.collectionName || "").toLowerCase().includes(q) ||
          (t.genre || "").toLowerCase().includes(q) ||
          (t.creatorUsername || "").toLowerCase().includes(q) ||
          (t.listingType || "").toLowerCase().includes(q) ||
          (t.listingStatus || "").toLowerCase().includes(q)
      );
    }

    if (activeGenre !== "All") {
      const targetGenre = activeGenre.toLowerCase();
      result = result.filter((t) => (t.genre || "").toLowerCase() === targetGenre);
    }

    if (priceRange !== "all") {
      result = result.filter((t) => {
        const val = parseTonValue(t.price);
        if (priceRange === "under_5") return val > 0 && val < 5;
        if (priceRange === "5_to_25") return val >= 5 && val <= 25;
        if (priceRange === "25_plus") return val > 25;
        return true;
      });
    }

    if (editionType !== "all") {
      result = result.filter((t) => {
        const total = Number(t.totalEditions || t.supply || 1);
        if (editionType === "single") return total === 1;
        if (editionType === "limited") return total > 1 && total <= 100;
        if (editionType === "open") return total > 100;
        return true;
      });
    }

    if (networkFilter !== "all") {
      result = result.filter(
        (t) => (t.network || TON_NETWORK_MODE).toLowerCase() === networkFilter
      );
    }

    switch (activeCategory) {
      case "Trending":
        if (sortBy === "default") {
          result.sort(
            (a, b) =>
              (b.playCount || 0) +
              (b.likes || 0) +
              (b.bidsCount || 0) * 5 -
              ((a.playCount || 0) + (a.likes || 0) + (a.bidsCount || 0) * 5)
          );
        }
        break;
      case "New Releases":
      case "Newly Minted":
      case "New Drops":
        result.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        break;
      case "Exclusive":
      case "Featured": {
        const flagged = result.filter(
          (t) =>
            t.isFeatured ||
            (t.rarity || "").toLowerCase() === "legendary" ||
            (t.rarity || "").toLowerCase() === "mythic" ||
            t.supply === 1 ||
            Boolean((t as any).stems_available)
        );
        result = flagged.length > 0 ? flagged : result.filter((t) => t.artistVerified);
        break;
      }
      case "Limited Editions":
        result = result.filter(
          (t) =>
            (t.supply && t.supply > 1 && t.supply <= 100) ||
            (t.totalEditions && t.totalEditions > 1 && t.totalEditions <= 100) ||
            (t.rarity || "").toLowerCase() === "rare" ||
            (t.rarity || "").toLowerCase() === "epic"
        );
        break;
      case "Music":
        result = result.filter((t) => Boolean(t.audioUrl) || Boolean(t.trackId));
        break;
      case "Music Collections":
      case "Collections":
        result = result.filter((t) => Boolean(t.collectionId || t.collectionName));
        break;
      case "Auctions":
      case "Live Auctions":
        result = result.filter((t) => t.listingType === "auction");
        break;
      case "Buy Now":
        result = result.filter(
          (t) =>
            t.listingType !== "auction" &&
            (t.listingStatus || "").toLowerCase() !== "sold" &&
            (t.listingStatus || "").toLowerCase() !== "unlisted" &&
            parseTonValue(t.price) > 0
        );
        break;
      case "Recently Listed":
      case "Listed NFTs":
        result = result
          .filter((t) => parseTonValue(t.price) > 0 || Boolean(t.listingType))
          .sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          });
        break;
      case "All NFTs":
      case "All":
      default:
        break;
    }

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => parseTonValue(a.price) - parseTonValue(b.price));
        break;
      case "price_desc":
        result.sort((a, b) => parseTonValue(b.price) - parseTonValue(a.price));
        break;
      case "recent":
        result.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        break;
      case "popular":
      case "trending":
        result.sort(
          (a, b) =>
            (b.playCount || 0) +
            (b.likes || 0) +
            (b.bidsCount || 0) * 5 -
            ((a.playCount || 0) + (a.likes || 0) + (a.bidsCount || 0) * 5)
        );
        break;
      case "ending_soon": {
        const now = Date.now();
        result.sort((a, b) => {
          const aEnd =
            a.listingType === "auction" && a.auctionEndTime
              ? new Date(a.auctionEndTime).getTime()
              : Infinity;
          const bEnd =
            b.listingType === "auction" && b.auctionEndTime
              ? new Date(b.auctionEndTime).getTime()
              : Infinity;
          const aValid = Number.isFinite(aEnd) && aEnd > now ? aEnd : Infinity;
          const bValid = Number.isFinite(bEnd) && bEnd > now ? bEnd : Infinity;
          if (aValid !== bValid) return aValid - bValid;
          return (b.listingType === "auction" ? 1 : 0) - (a.listingType === "auction" ? 1 : 0);
        });
        break;
      }
      default:
        break;
    }

    return result;
  }, [allNFTs, debouncedSearch, activeCategory, activeGenre, priceRange, editionType, networkFilter, sortBy]);

  const paginatedNFTs = useMemo(() => {
    return filteredNFTs.slice(0, pageSize);
  }, [filteredNFTs, pageSize]);

  const hasMoreNFTs = paginatedNFTs.length < filteredNFTs.length;

  const loadMoreNFTs = useCallback(() => {
    setPageSize((prev) => prev + PAGE_STEP);
  }, []);

  // Owned NFTs strictly verified from connected wallet or authenticated Firestore UID (never fake)
  const myNFTs = useMemo<MarketplaceNFT[]>(() => {
    const uid = audio.userProfile?.uid || "";
    const ownedIds = new Set(audio.userProfile?.ownedNftIds || []);
    const activeAddr = (walletAddress || audio.userProfile?.walletAddress || "").trim();

    if (!activeAddr && !uid && ownedIds.size === 0) {
      return [];
    }

    let list = allNFTs.filter((nft) => {
      if (ownedIds.has(nft.id)) return true;
      if (activeAddr && (nft.owner === activeAddr || nft.stakedOwnerAddress === activeAddr)) {
        return true;
      }
      if (uid && (nft.ownerId === uid || nft.owner === uid)) {
        return true;
      }
      return false;
    });

    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.artist || "").toLowerCase().includes(q) ||
          (t.collectionName || "").toLowerCase().includes(q) ||
          (t.genre || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [allNFTs, walletAddress, audio.userProfile, debouncedSearch]);

  // Featured NFT strictly from real Firestore records (hidden when none exist)
  const featuredNFT = useMemo<MarketplaceNFT | null>(() => {
    if (allNFTs.length === 0) return null;
    return (
      allNFTs.find((t) => t.isFeatured) ||
      allNFTs.find((t) => t.artistVerified && parseTonValue(t.price) > 0) ||
      allNFTs.find((t) => parseTonValue(t.price) > 0) ||
      null
    );
  }, [allNFTs]);

  // Real auctions strictly derived from Firestore NFTs without fake countdowns/bids
  const liveAuctions = useMemo<LiveAuction[]>(() => {
    const nowMs = Date.now();
    let list: LiveAuction[] = allNFTs
      .filter((t) => t.listingType === "auction")
      .map((nft) => {
        const status = resolveAuctionStatus(nft, nowMs);
        const currentNumeric = parseTonValue(nft.currentBid || nft.price);
        const increment = 0.5;
        const minNextNumeric = currentNumeric > 0 ? currentNumeric + increment : increment;

        return {
          id: nft.id,
          nft,
          currentBid: nft.currentBid || nft.price || "0 TON",
          minimumNextBid: `${minNextNumeric.toFixed(2).replace(/\.00$/, "")} TON`,
          highestBidder: nft.highestBidder || "",
          startsAt: nft.auctionStartTime || "",
          endsAt: nft.auctionEndTime || "",
          minIncrement: `${increment} TON`,
          watchers: Number(nft.watchers || 0),
          bidsCount: Number(nft.bidsCount || 0),
          status,
          isLive: status === "active",
          recentBids: (nft.offers || []).slice(0, 3).map((o) => ({
            id: o.id,
            bidder: o.offerer,
            amount: o.price.includes("TON") ? o.price : `${o.price} TON`,
            timestamp: o.timestamp,
          })),
        };
      });

    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (a) =>
          (a.nft.title || "").toLowerCase().includes(q) ||
          (a.nft.artist || "").toLowerCase().includes(q) ||
          (a.nft.collectionName || "").toLowerCase().includes(q) ||
          (a.nft.genre || "").toLowerCase().includes(q) ||
          (a.nft.creatorUsername || "").toLowerCase().includes(q)
      );
    }

    if (activeGenre !== "All") {
      const targetGenre = activeGenre.toLowerCase();
      list = list.filter((a) => (a.nft.genre || "").toLowerCase() === targetGenre);
    }

    if (priceRange !== "all") {
      list = list.filter((a) => {
        const val = parseTonValue(a.currentBid || a.nft.price);
        if (priceRange === "under_5") return val > 0 && val < 5;
        if (priceRange === "5_to_25") return val >= 5 && val <= 25;
        if (priceRange === "25_plus") return val > 25;
        return true;
      });
    }

    if (editionType !== "all") {
      list = list.filter((a) => {
        const total = Number(a.nft.totalEditions || a.nft.supply || 1);
        if (editionType === "single") return total === 1;
        if (editionType === "limited") return total > 1 && total <= 100;
        if (editionType === "open") return total > 100;
        return true;
      });
    }

    if (networkFilter !== "all") {
      list = list.filter(
        (a) => (a.nft.network || TON_NETWORK_MODE).toLowerCase() === networkFilter
      );
    }

    return list;
  }, [allNFTs, debouncedSearch, activeGenre, priceRange, editionType, networkFilter]);

  // Collections strictly from Firestore with honest floor/volume when available
  const trendingCollections = useMemo<NFTCollection[]>(() => {
    let list = firestoreCollections.map((c) => {
      const colNFTs = allNFTs.filter((n) => n.collectionId === c.id);
      const prices = colNFTs.map((n) => parseTonValue(n.price)).filter((p) => p > 0);
      const computedFloor = prices.length > 0 ? `${Math.min(...prices)} TON` : undefined;
      return {
        ...c,
        itemCount: collectionNFTCounts[c.id] ?? (colNFTs.length || c.itemCount || 0),
        floorPrice: c.floorPrice
          ? c.floorPrice.includes("TON")
            ? c.floorPrice
            : `${c.floorPrice} TON`
          : computedFloor,
        volume: c.volume
          ? c.volume.includes("TON")
            ? c.volume
            : `${c.volume} TON`
          : undefined,
      };
    });

    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.creator.toLowerCase().includes(q)
      );
    }

    return list;
  }, [firestoreCollections, collectionNFTCounts, allNFTs, debouncedSearch]);

  // Top buyers derived from recentSales
  const topBuyers = useMemo<LeaderboardUser[]>(() => {
    const buyerTotals = new Map<
      string,
      { name: string; address: string; spent: number; count: number }
    >();
    recentSales.forEach((sale) => {
      const key = sale.buyerAddress || sale.buyerName;
      if (!key) return;
      const priceVal = parseTonValue(sale.price);
      const existing = buyerTotals.get(key) || {
        name: sale.buyerName || "Collector",
        address: sale.buyerAddress || "",
        spent: 0,
        count: 0,
      };
      existing.spent += priceVal;
      existing.count += 1;
      buyerTotals.set(key, existing);
    });

    return Array.from(buyerTotals.entries())
      .sort((a, b) => b[1].spent - a[1].spent)
      .slice(0, 10)
      .map(([key, val]) => ({
        id: key,
        name: val.name,
        username: val.address ? `${val.address.slice(0, 6)}...` : "",
        avatar: "",
        isVerified: false,
        nftsOwnedCount: val.count,
        tonSpent: val.spent.toFixed(1),
        revenueTON: "0",
        followersCount: 0,
      }));
  }, [recentSales]);

  // Dynamic genre counts strictly from live Firestore NFTs
  const genreCategories = useMemo<GenreCategory[]>(() => {
    return availableGenres.map((genreName, idx) => {
      const matchingNFTs = allNFTs.filter(
        (n) => (n.genre || "").toLowerCase() === genreName.toLowerCase()
      );
      return {
        id: `genre-${idx}-${genreName.toLowerCase().replace(/\s+/g, "-")}`,
        name: genreName,
        count: `${matchingNFTs.length} ${matchingNFTs.length === 1 ? "NFT" : "NFTs"}`,
        numericCount: matchingNFTs.length,
        coverUrl: matchingNFTs[0]?.imageUrl || matchingNFTs[0]?.coverUrl || "",
        colorClass: GENRE_COLOR_CLASSES[genreName] || "from-blue-700 to-slate-900",
      };
    });
  }, [availableGenres, allNFTs]);

  // Marketplace analytics strictly from Firestore data
  const analyticsStats = useMemo<MarketplaceStats>(() => {
    const numericPrices = allNFTs
      .map((n) => parseTonValue(n.price))
      .filter((p) => p > 0);

    const salesPrices = recentSales
      .map((s) => parseTonValue(s.price))
      .filter((p) => p > 0);

    const minPrice = numericPrices.length > 0 ? Math.min(...numericPrices) : 0;
    const totalSalesVol = salesPrices.reduce((acc, p) => acc + p, 0);
    const highestSale = salesPrices.length > 0 ? Math.max(...salesPrices) : 0;
    const uniqueOwners = new Set(allNFTs.map((n) => n.owner).filter(Boolean)).size;

    return {
      volumeTotal: `${totalSalesVol.toFixed(1)} TON`,
      volumeChange24h: "0%",
      dailySalesCount: recentSales.length,
      weeklySalesCount: recentSales.length,
      monthlySalesCount: recentSales.length,
      totalOwners: uniqueOwners,
      floorPrice: `${minPrice.toFixed(1)} TON`,
      highestSale: `${highestSale.toFixed(1)} TON`,
    };
  }, [allNFTs, recentSales]);

  // Real curated horizontal-scroll shelf slices derived from Firestore data
  const trendingNFTs = useMemo<MarketplaceNFT[]>(() => {
    return [...allNFTs]
      .sort(
        (a, b) =>
          (b.playCount || 0) +
          (b.likes || 0) +
          (b.bidsCount || 0) * 5 -
          ((a.playCount || 0) + (a.likes || 0) + (a.bidsCount || 0) * 5)
      )
      .slice(0, 12);
  }, [allNFTs]);

  const recentlyListedNFTs = useMemo<MarketplaceNFT[]>(() => {
    return [...allNFTs]
      .filter((t) => parseTonValue(t.price) > 0 || Boolean(t.listingType))
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 12);
  }, [allNFTs]);

  const exclusiveDrops = useMemo<MarketplaceNFT[]>(() => {
    const exclusive = allNFTs.filter(
      (t) =>
        t.isFeatured ||
        (t.rarity || "").toLowerCase() === "legendary" ||
        (t.rarity || "").toLowerCase() === "mythic" ||
        t.supply === 1 ||
        Boolean((t as any).stems_available)
    );
    if (exclusive.length > 0) return exclusive.slice(0, 12);
    return allNFTs.filter((t) => t.artistVerified).slice(0, 12);
  }, [allNFTs]);

  const recommendedNFTs = useMemo<MarketplaceNFT[]>(() => {
    const likedSet = new Set(audio.likedTrackIds || []);
    const preferredGenres = new Set<string>();
    (audio.allTracks || []).forEach((track) => {
      if (likedSet.has(track.id) && track.genre) {
        preferredGenres.add(track.genre.toLowerCase());
      }
    });

    if (preferredGenres.size === 0) {
      return [...allNFTs]
        .sort(
          (a, b) =>
            (b.artistVerified ? 1 : 0) - (a.artistVerified ? 1 : 0) ||
            (b.likes || 0) - (a.likes || 0)
        )
        .slice(0, 12);
    }

    return [...allNFTs]
      .sort((a, b) => {
        const aMatch = a.genre && preferredGenres.has(a.genre.toLowerCase()) ? 1 : 0;
        const bMatch = b.genre && preferredGenres.has(b.genre.toLowerCase()) ? 1 : 0;
        if (bMatch !== aMatch) return bMatch - aMatch;
        return (b.playCount || 0) - (a.playCount || 0);
      })
      .slice(0, 12);
  }, [allNFTs, audio.likedTrackIds, audio.allTracks]);

  const featuredNFTs = useMemo<MarketplaceNFT[]>(() => {
    const flagged = allNFTs.filter(
      (t) => t.isFeatured || (t.artistVerified && parseTonValue(t.price) > 0)
    );
    return (flagged.length > 0 ? flagged : allNFTs).slice(0, 12);
  }, [allNFTs]);

  const newlyVerifiedArtists = useMemo<LeaderboardUser[]>(() => {
    return verifiedArtists.slice(0, 12);
  }, [verifiedArtists]);

  const hasAuctions = useMemo(
    () => liveAuctions.length > 0 || allNFTs.some((n) => n.listingType === "auction"),
    [liveAuctions, allNFTs]
  );

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setActiveCategory("All NFTs");
    setActiveGenre("All");
    setPriceRange("all");
    setEditionType("all");
    setNetworkFilter("all");
    setSortBy("default");
    setPageSize(PAGE_STEP);
  }, []);

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    activeCategory,
    setActiveCategory,
    activeGenre,
    setActiveGenre,
    availableGenres,
    priceRange,
    setPriceRange,
    editionType,
    setEditionType,
    networkFilter,
    setNetworkFilter,
    sortBy,
    setSortBy,
    isLoading,
    error,
    retryLoad,
    isOffline,
    walletAddress,
    isWalletConnected,
    tonBalance,
    walletNetwork,
    connectWallet,
    disconnectWallet,
    filteredNFTs,
    paginatedNFTs,
    hasMoreNFTs,
    loadMoreNFTs,
    myNFTs,
    allNFTs,
    featuredNFT,
    featuredNFTs,
    trendingNFTs,
    recentlyListedNFTs,
    exclusiveDrops,
    recommendedNFTs,
    newlyVerifiedArtists,
    hasAuctions,
    liveAuctions,
    trendingCollections,
    topArtists: verifiedArtists,
    topSellers: verifiedArtists.slice(0, 10),
    topBuyers,
    recentSales,
    analyticsStats,
    genreCategories,
    collectionNFTCounts,
    likedTrackIds: audio.likedTrackIds || [],
    toggleLikeTrack: audio.toggleLikeTrack,
    handleResetFilters,
  };
};
