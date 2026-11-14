import { useState, useEffect, useMemo } from "react";
import { NFTItem, Artist, UserProfile } from "@/types";
import {
  NFTCollection,
  LiveAuction,
  LeaderboardUser,
  RecentSale,
  GenreCategory,
  MarketplaceStats,
} from "../types";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import {
  collection,
  query,
  limit,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

const BASE_GENRES: Array<{ id: string; name: string; colorClass: string }> = [
  { id: "g1", name: "Afrobeats", colorClass: "from-amber-600 to-yellow-900" },
  { id: "g2", name: "Hip-Hop", colorClass: "from-blue-600 to-indigo-950" },
  { id: "g3", name: "Amapiano", colorClass: "from-purple-600 to-pink-950" },
  { id: "g4", name: "Pop", colorClass: "from-emerald-600 to-teal-950" },
  { id: "g5", name: "Electronic", colorClass: "from-cyan-600 to-blue-950" },
  { id: "g6", name: "R&B", colorClass: "from-rose-600 to-red-950" },
  { id: "g7", name: "Gospel", colorClass: "from-amber-500 to-stone-900" },
  { id: "g8", name: "Jazz", colorClass: "from-sky-700 to-slate-900" },
  { id: "g9", name: "Classical", colorClass: "from-zinc-600 to-neutral-900" },
  { id: "g10", name: "Experimental", colorClass: "from-fuchsia-700 to-purple-950" },
];

export const useMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [firestoreNFTs, setFirestoreNFTs] = useState<NFTItem[]>([]);
  const [firestoreCollections, setFirestoreCollections] = useState<NFTCollection[]>([]);
  const [verifiedArtists, setVerifiedArtists] = useState<LeaderboardUser[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [collectionNFTCounts, setCollectionNFTCounts] = useState<Record<string, number>>({});

  // Real TON Connect wallet hook
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const isWalletConnected = Boolean(walletAddress);

  const connectWallet = () => {
    if (tonConnectUI) {
      try {
        tonConnectUI.openModal();
      } catch (err) {
        console.warn("[useMarketplace] Failed to open TON Connect modal:", err);
      }
    }
  };

  const disconnectWallet = async () => {
    if (tonConnectUI && tonConnectUI.connected) {
      try {
        await tonConnectUI.disconnect();
      } catch (err) {
        console.warn("[useMarketplace] Error disconnecting wallet:", err);
      }
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

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
    const nftsQuery = query(collection(db, "nfts"), limit(100));
    const unsubscribeNFTs = onSnapshot(
      nftsQuery,
      (snapshot) => {
        const loaded: NFTItem[] = [];
        const counts: Record<string, number> = {};

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const rawPrice = data.price !== undefined && data.price !== null ? String(data.price) : "0 TON";
          const formattedPrice = rawPrice.includes("TON") ? rawPrice : `${rawPrice} TON`;
          const colId = data.collectionId || data.albumId;
          if (colId) {
            counts[colId] = (counts[colId] || 0) + 1;
          }

          loaded.push({
            id: docSnap.id,
            trackId: data.trackId || docSnap.id,
            title: data.title || "Untitled NFT",
            artist: data.creator || data.artist || "Unknown Artist",
            artistId: data.artistId || data.creatorId || "",
            owner: data.owner || data.ownerAddress || "",
            creator: data.creator || data.artist || "Unknown Artist",
            imageUrl: data.imageUrl || data.coverUrl || "",
            coverUrl: data.coverUrl || data.imageUrl || "",
            audioUrl: data.audioUrl || data.mediaUrl || "",
            price: formattedPrice,
            listingType: data.listingType || "fixed",
            isNFT: true,
            artistVerified: Boolean(data.artistVerified),
            edition: data.edition || "1/1",
            rarity: data.rarity || "Common",
            genre: data.genre || "",
            playCount: Number(data.playCount || 0),
            likes: Number(data.likes || 0),
            highestBidder: data.highestBidder || "",
            currentBid: data.currentBid ? String(data.currentBid) : formattedPrice,
            auctionEndTime: data.auctionEndTime || data.endsAt || "",
            bidsCount: Number(data.bidsCount || (Array.isArray(data.bids) ? data.bids.length : 0)),
            watchers: Number(data.watchers || 0),
            collectionId: colId || "",
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || ""),
          } as any);
        });

        setFirestoreNFTs(loaded);
        setCollectionNFTCounts((prev) => ({ ...prev, ...counts }));
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "nfts");
        setIsLoading(false);
      }
    );

    const colQuery = query(collection(db, "collections"), limit(50));
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

          cols.push({
            id: docSnap.id,
            name: data.name || "Untitled Collection",
            creator: data.creatorName || data.creator || "TonJam Creator",
            creatorId: data.creatorId || data.artistId || "",
            volume: String(data.volume || "0"),
            owners: Number(data.ownersCount || data.owners || 0),
            floorPrice: String(data.floorPrice || "0"),
            imageUrl: data.imageUrl || data.coverUrl || "",
            itemCount: Number(total || 0),
            verified: Boolean(data.verified ?? data.creatorVerified ?? false),
            description: data.description || "",
          });
        });

        setFirestoreCollections(cols);
        setCollectionNFTCounts((prev) => ({ ...colCounts, ...prev }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "collections");
      }
    );

    const artistsQuery = query(
      collection(db, "users"),
      where("isVerifiedArtist", "==", true),
      limit(30)
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
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "users");
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
            price: data.price ? (String(data.price).includes("TON") ? String(data.price) : `${data.price} TON`) : "0 TON",
            timestamp: ts,
          };
        });
        setRecentSales(sales);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "nftSales");
      }
    );

    return () => {
      unsubscribeNFTs();
      unsubscribeCols();
      unsubscribeArtists();
      unsubscribeSales();
    };
  }, []);

  const allNFTs = firestoreNFTs;

  // Filter based on category & debounced search term
  const filteredNFTs = useMemo(() => {
    let result = [...allNFTs];

    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.artist || "").toLowerCase().includes(q) ||
          (Boolean((t as any).albumId) && String((t as any).albumId).toLowerCase().includes(q)) ||
          (Boolean((t as any).genre) && String((t as any).genre).toLowerCase().includes(q))
      );
    }

    switch (activeCategory) {
      case "Tracks":
      case "Singles":
        result = result.filter((t) => !(t as any).albumId || (t as any).isNFT);
        break;
      case "Albums":
        result = result.filter((t) => Boolean((t as any).albumId));
        break;
      case "Artist Shares":
        result = result.filter((t) => (t as any).edition?.includes("/") || (t as any).rarity === "Legendary");
        break;
      case "Live Auctions":
      case "Auctions":
        result = result.filter((t) => t.listingType === "auction");
        break;
      case "Newly Minted":
      case "New":
      case "New Drops":
        result = [...result].reverse().slice(0, 50);
        break;
      case "Verified Artists":
        result = result.filter((t) => t.artistVerified);
        break;
      case "Limited Editions":
        result = result.filter((t) => t.rarity === "Legendary" || t.rarity === "Rare" || Boolean(t.edition));
        break;
      case "All":
      default:
        break;
    }

    switch (sortBy) {
      case "price_asc":
        result.sort(
          (a, b) =>
            parseFloat(String(a.price || "0").replace(/[^\d.]/g, "") || "0") -
            parseFloat(String(b.price || "0").replace(/[^\d.]/g, "") || "0")
        );
        break;
      case "price_desc":
        result.sort(
          (a, b) =>
            parseFloat(String(b.price || "0").replace(/[^\d.]/g, "") || "0") -
            parseFloat(String(a.price || "0").replace(/[^\d.]/g, "") || "0")
        );
        break;
      case "recent":
        result.reverse();
        break;
      case "popular":
      case "trending":
        result.sort((a, b) => ((b as any).playCount || 0) - ((a as any).playCount || 0));
        break;
      default:
        break;
    }

    return result;
  }, [allNFTs, debouncedSearch, activeCategory, sortBy]);

  const featuredNFT = useMemo(() => {
    return allNFTs.find((t) => t.artistVerified && t.listingType === "auction") || allNFTs[0] || null;
  }, [allNFTs]);

  // Live auctions strictly derived from Firestore NFTs
  const liveAuctions = useMemo<LiveAuction[]>(() => {
    let list = allNFTs
      .filter((t) => t.listingType === "auction")
      .map((nft: any) => ({
        id: nft.id,
        nft,
        currentBid: nft.currentBid || nft.price || "0 TON",
        highestBidder: nft.highestBidder || "",
        endsAt: nft.auctionEndTime || "",
        minIncrement: "0.5 TON",
        watchers: Number(nft.watchers || 0),
        bidsCount: Number(nft.bidsCount || 0),
        isLive: true,
      }));

    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (a) =>
          a.nft.title.toLowerCase().includes(q) ||
          (a.nft.artist || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [allNFTs, debouncedSearch]);

  // Trending collections strictly from Firestore
  const trendingCollections = useMemo<NFTCollection[]>(() => {
    let list = firestoreCollections.map((c) => ({
      ...c,
      itemCount: collectionNFTCounts[c.id] ?? c.itemCount ?? 0,
    }));

    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.creator.toLowerCase().includes(q)
      );
    }

    return list;
  }, [firestoreCollections, collectionNFTCounts, debouncedSearch]);

  // Top buyers derived from recentSales
  const topBuyers = useMemo<LeaderboardUser[]>(() => {
    const buyerTotals = new Map<string, { name: string; address: string; spent: number; count: number }>();
    recentSales.forEach((sale) => {
      const key = sale.buyerAddress || sale.buyerName;
      if (!key) return;
      const priceVal = parseFloat(String(sale.price).replace(/[^\d.]/g, "")) || 0;
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
    return BASE_GENRES.map((genre) => {
      const matchingNFTs = allNFTs.filter(
        (n: any) => (n.genre || "").toLowerCase() === genre.name.toLowerCase()
      );
      return {
        id: genre.id,
        name: genre.name,
        count: `${matchingNFTs.length} NFTs`,
        coverUrl: matchingNFTs[0]?.imageUrl || matchingNFTs[0]?.coverUrl || "",
        colorClass: genre.colorClass,
      };
    });
  }, [allNFTs]);

  // Marketplace analytics strictly from Firestore data (zeroed when empty)
  const analyticsStats = useMemo<MarketplaceStats>(() => {
    const numericPrices = allNFTs
      .map((n) => parseFloat(String(n.price || "0").replace(/[^\d.]/g, "") || "0"))
      .filter((p) => !isNaN(p) && p > 0);

    const salesPrices = recentSales
      .map((s) => parseFloat(String(s.price || "0").replace(/[^\d.]/g, "") || "0"))
      .filter((p) => !isNaN(p) && p > 0);

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

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setActiveCategory("All");
    setSortBy("default");
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    isLoading,
    isOffline,
    walletAddress,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    filteredNFTs,
    allNFTs,
    featuredNFT,
    liveAuctions,
    trendingCollections,
    topArtists: verifiedArtists,
    topSellers: verifiedArtists.slice(0, 10),
    topBuyers,
    recentSales,
    analyticsStats,
    genreCategories,
    collectionNFTCounts,
    handleResetFilters,
  };
};
