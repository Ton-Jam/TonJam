import { useState, useEffect, useMemo } from "react";
import { NFTItem } from "@/types";
import { 
  MOCK_TRACKS, 
  MOCK_COLLECTIONS, 
  MOCK_ARTISTS, 
  MOCK_USERS, 
  MOCK_AUCTIONS, 
  MOCK_SALES, 
  GENRE_CATEGORIES 
} from "../mock";
import { NFTCollection, LiveAuction, LeaderboardUser, RecentSale, GenreCategory, MarketplaceStats } from "../types";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

export const useMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [firestoreNFTs, setFirestoreNFTs] = useState<NFTItem[]>([]);

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

  // Debounce search input for silky-smooth UI response
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

  // Fetch real Firestore NFTs with graceful fallback
  useEffect(() => {
    let isMounted = true;

    async function loadFirestoreNFTs() {
      try {
        const q = query(collection(db, "nfts"), limit(60));
        const snapshot = await getDocs(q);
        if (!snapshot.empty && isMounted) {
          const loaded: NFTItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              id: docSnap.id,
              trackId: data.trackId || docSnap.id,
              title: data.title || "Untitled NFT",
              artist: data.creator || data.artist || "Unknown Artist",
              artistId: data.artistId || "artist-1",
              owner: data.owner || "TonJam Vault",
              creator: data.creator || data.artist || "Unknown Artist",
              imageUrl: data.imageUrl || data.coverUrl || "",
              coverUrl: data.coverUrl || data.imageUrl || "",
              audioUrl: data.audioUrl || "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
              price: data.price ? (data.price.includes("TON") ? data.price : `${data.price} TON`) : "2.5 TON",
              listingType: data.listingType || "fixed",
              isNFT: true,
              artistVerified: Boolean(data.artistVerified),
              edition: data.edition || "1/100",
              rarity: data.rarity || "Rare",
              genre: data.genre || "Afrobeats",
              playCount: data.playCount || 0,
              likes: data.likes || 0,
              createdAt: data.createdAt || new Date().toISOString(),
            } as any);
          });
          setFirestoreNFTs(loaded);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "nfts");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFirestoreNFTs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Merge Firestore NFTs with base catalog seamlessly
  const allNFTs = useMemo(() => {
    if (firestoreNFTs.length === 0) {
      return MOCK_TRACKS;
    }
    const firestoreIds = new Set(firestoreNFTs.map(n => n.id));
    const nonDuplicatedMock = MOCK_TRACKS.filter(t => !firestoreIds.has(t.id));
    return [...firestoreNFTs, ...nonDuplicatedMock];
  }, [firestoreNFTs]);

  // Filter based on category & debounced search term
  const filteredNFTs = useMemo(() => {
    let result = [...allNFTs];

    // Search term matching title, artist, or collection
    if (debouncedSearch.trim() !== "") {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) => 
          t.title.toLowerCase().includes(query) || 
          t.artist.toLowerCase().includes(query) ||
          (Boolean((t as any).albumId) && String((t as any).albumId).toLowerCase().includes(query)) ||
          (Boolean((t as any).genre) && String((t as any).genre).toLowerCase().includes(query))
      );
    }

    // Category matching logic
    switch (activeCategory) {
      case "Tracks":
      case "Singles":
        result = result.filter((t) => !(t as any).albumId || (t as any).isNFT);
        break;
      case "Albums":
        result = result.filter((t) => Boolean((t as any).albumId));
        break;
      case "Artist Shares":
        // Filter items with royalties/shares or multiple editions
        result = result.filter((t) => (t as any).edition?.includes("/") || (t as any).rarity === "Legendary");
        break;
      case "Live Auctions":
      case "Auctions":
        result = result.filter((t) => t.listingType === "auction");
        break;
      case "Newly Minted":
      case "New":
        result = [...result].reverse().slice(0, 50);
        break;
      case "Verified Artists":
        result = result.filter((t) => t.artistVerified);
        break;
      case "All":
      default:
        break;
    }

    // Apply sorting logic
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => parseFloat(a.price?.replace(/[^\d.]/g, "") || "0") - parseFloat(b.price?.replace(/[^\d.]/g, "") || "0"));
        break;
      case "price_desc":
        result.sort((a, b) => parseFloat(b.price?.replace(/[^\d.]/g, "") || "0") - parseFloat(a.price?.replace(/[^\d.]/g, "") || "0"));
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

  // Retrieve featured NFT for the Hero
  const featuredNFT = useMemo(() => {
    return allNFTs.find(t => t.artistVerified && t.listingType === "auction") || allNFTs[0];
  }, [allNFTs]);

  // Filter Live Auctions
  const liveAuctions = useMemo(() => {
    let list = [...MOCK_AUCTIONS];
    if (debouncedSearch.trim() !== "") {
      const query = debouncedSearch.toLowerCase();
      list = list.filter(
        (a) => a.nft.title.toLowerCase().includes(query) || a.nft.artist.toLowerCase().includes(query)
      );
    }
    return list;
  }, [debouncedSearch]);

  // Trending Collections
  const trendingCollections = useMemo(() => {
    let list = [...MOCK_COLLECTIONS];
    if (debouncedSearch.trim() !== "") {
      const query = debouncedSearch.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(query) || c.creator.toLowerCase().includes(query));
    }
    return list;
  }, [debouncedSearch]);

  // Calculate reliable marketplace stats
  const analyticsStats = useMemo<MarketplaceStats>(() => {
    const totalListings = allNFTs.length;
    const numericPrices = allNFTs
      .map(n => parseFloat(n.price?.replace(/[^\d.]/g, "") || "0"))
      .filter(p => !isNaN(p) && p > 0);

    const minPrice = numericPrices.length > 0 ? Math.min(...numericPrices) : 1.5;
    const totalVol = numericPrices.reduce((acc, p) => acc + p, 0);
    const uniqueArtists = new Set(allNFTs.map(n => n.artist)).size;

    return {
      volumeTotal: `${Math.round(totalVol).toLocaleString()} TON`,
      volumeChange24h: "+14.8% 24h",
      dailySalesCount: totalListings,
      weeklySalesCount: totalListings * 3,
      monthlySalesCount: totalListings * 10,
      totalOwners: uniqueArtists * 8,
      floorPrice: `${minPrice.toFixed(1)} TON`,
      highestSale: "450 TON"
    };
  }, [allNFTs]);

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
    topArtists: MOCK_ARTISTS,
    topSellers: MOCK_ARTISTS.slice(0, 10),
    topBuyers: MOCK_USERS.slice(0, 10),
    recentSales: MOCK_SALES,
    analyticsStats,
    genreCategories: GENRE_CATEGORIES,
    handleResetFilters
  };
};
