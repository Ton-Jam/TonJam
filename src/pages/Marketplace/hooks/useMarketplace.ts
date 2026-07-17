import { useState, useEffect, useMemo } from "react";
import { NFTItem } from "@/types";
import { 
  MOCK_TRACKS, 
  MOCK_COLLECTIONS, 
  MOCK_ARTISTS, 
  MOCK_USERS, 
  MOCK_AUCTIONS, 
  MOCK_SALES, 
  MOCK_STATS, 
  GENRE_CATEGORIES 
} from "../mock";
import { NFTCollection, LiveAuction, LeaderboardUser, RecentSale, GenreCategory, MarketplaceStats } from "../types";

export const useMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isWalletConnected, setIsWalletConnected] = useState(true); // default true for demo or integration

  // Skeletons reveal simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

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

  // Filter 300 tracks based on category & search term
  const filteredNFTs = useMemo(() => {
    let result = [...MOCK_TRACKS];

    // Search term matching title or artist
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query)
      );
    }

    // Category matching logic
    switch (activeCategory) {
      case "Music":
      case "Music NFTs":
        result = result.filter((t) => (t as any).isNFT);
        break;
      case "Albums":
        // Filter some items associated with Albums
        result = result.filter((t) => !!(t as any).albumId);
        break;
      case "Singles":
        // Filter items that aren't parts of collections/albums
        result = result.filter((t) => !(t as any).albumId);
        break;
      case "Auctions":
      case "Live Auctions":
        result = result.filter((t) => t.listingType === "auction");
        break;
      case "Fixed Price":
      case "Buy Now":
        result = result.filter((t) => t.listingType === "fixed");
        break;
      case "New":
      case "Newly Minted":
        // Newest tracks
        result = result.slice(0, 50);
        break;
      case "Trending":
        // Highly played/liked tracks
        result = result.sort((a, b) => ((b as any).playCount || 0) - ((a as any).playCount || 0));
        break;
      case "Highest Volume":
        result = result.sort((a, b) => {
          const priceA = parseFloat(a.price || "0");
          const priceB = parseFloat(b.price || "0");
          return priceB - priceA;
        });
        break;
      case "Verified Artists":
        result = result.filter((t) => t.artistVerified);
        break;
      case "Free Mint":
        result = result.filter((t) => !t.price || parseFloat(t.price) === 0);
        break;
      case "All":
      default:
        break;
    }

    return result;
  }, [searchTerm, activeCategory]);

  // Retrieve featured NFT for the Hero
  const featuredNFT = useMemo(() => {
    // Return a gorgeous verified track with price and auction
    return MOCK_TRACKS.find(t => t.artistVerified && t.listingType === "auction") || MOCK_TRACKS[0];
  }, []);

  // Filter Live Auctions
  const liveAuctions = useMemo(() => {
    let list = [...MOCK_AUCTIONS];
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      list = list.filter(
        (a) => a.nft.title.toLowerCase().includes(query) || a.nft.artist.toLowerCase().includes(query)
      );
    }
    return list;
  }, [searchTerm]);

  // Trending Collections
  const trendingCollections = useMemo(() => {
    let list = [...MOCK_COLLECTIONS];
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(query) || c.creator.toLowerCase().includes(query));
    }
    return list;
  }, [searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveCategory("All");
  };

  return {
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    isLoading,
    isOffline,
    isWalletConnected,
    setIsWalletConnected,
    filteredNFTs,
    featuredNFT,
    liveAuctions,
    trendingCollections,
    topArtists: MOCK_ARTISTS,
    topSellers: MOCK_ARTISTS.sort((a, b) => parseFloat(b.revenueTON.replace(/,/g, "")) - parseFloat(a.revenueTON.replace(/,/g, ""))),
    topBuyers: MOCK_USERS,
    recentSales: MOCK_SALES,
    analyticsStats: MOCK_STATS,
    genreCategories: GENRE_CATEGORIES,
    handleResetFilters
  };
};
