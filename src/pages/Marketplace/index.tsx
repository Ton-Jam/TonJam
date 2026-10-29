import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { useTonConnectUI } from "@tonconnect/ui-react";
import {
  MarketplaceHeader,
  FilterPill,
  MusicNFTCard,
  AuctionCard,
  CollectionCard,
  MarketplaceSectionHeader,
  MarketplaceTransparency,
  MusicNFTData,
  AuctionData,
  CollectionData,
  CarouselSkeletonList,
} from "@/components/marketplace";
import { QuickBuyNFTModal, QuickBuyNFTData } from "@/components/marketplace/QuickBuyNFTModal";
import { useMarketplace } from "./hooks/useMarketplace";
import { MOCK_COLLECTIONS, MOCK_AUCTIONS } from "./mock";
import { PRIMARY_COLLECTIONS } from "@/data/collectionsData";

// Curated example cards explicitly requested in specification
const CURATED_TRENDING_NFTS: MusicNFTData[] = [
  {
    id: "curated-1",
    title: "Midnight Frequency",
    artist: "Krupy Vibez",
    artistVerified: true,
    price: "3.5 TON",
    edition: "12 of 50",
    genre: "Afrobeats",
    badge: "EXCLUSIVE",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    status: "Instant Collect",
  },
  {
    id: "curated-2",
    title: "Lagos After Dark",
    artist: "Dangana Elias",
    artistVerified: true,
    price: "2.8 TON",
    edition: "4 of 25",
    genre: "Amapiano",
    badge: "LIMITED",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    status: "Instant Collect",
  },
  {
    id: "curated-3",
    title: "Blue Horizon",
    artist: "Featured Artist",
    artistVerified: true,
    price: "4.2 TON",
    edition: "1 of 10",
    genre: "Electronic",
    badge: "1 OF 10",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/soundtrack.mp3",
    status: "Instant Collect",
  },
  {
    id: "curated-4",
    title: "Rhythm of Tomorrow",
    artist: "Exclusive Collection",
    artistVerified: true,
    price: "5.0 TON",
    edition: "7 of 50",
    genre: "Soul & Jazz",
    badge: "EXCLUSIVE",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    status: "Instant Collect",
  },
  {
    id: "curated-5",
    title: "Subtle Echoes",
    artist: "Astro Beats",
    artistVerified: true,
    price: "3.2 TON",
    edition: "18 of 100",
    genre: "Ambient",
    badge: "LIMITED",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/soundtrack.mp3",
    status: "Instant Collect",
  },
  {
    id: "curated-6",
    title: "Golden Hour Symphony",
    artist: "Lara Moon",
    artistVerified: true,
    price: "6.0 TON",
    edition: "2 of 20",
    genre: "R&B",
    badge: "EXCLUSIVE",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    status: "Instant Collect",
  },
];

const CATEGORIES = [
  "All",
  "Trending",
  "New Drops",
  "Auctions",
  "Limited Editions",
];

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  const {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    filteredNFTs,
    allNFTs,
    isLoading,
    isWalletConnected,
    collectionNFTCounts,
  } = useMarketplace();

  const [quickBuyNFT, setQuickBuyNFT] = useState<QuickBuyNFTData | null>(null);

  // Combine curated and dynamic NFTs
  const trendingNFTs: MusicNFTData[] = useMemo(() => {
    // If search term is present, filter across both
    const baseList = [...CURATED_TRENDING_NFTS];
    
    // Add dynamic items from firestore/mock
    const dynamicConverted: MusicNFTData[] = (allNFTs || []).slice(0, 16).map((item: any) => ({
      id: item.id,
      title: item.title,
      artist: item.artist || item.creator || "TonJam Artist",
      artistVerified: Boolean(item.artistVerified),
      price: item.price ? (String(item.price).includes("TON") ? item.price : `${item.price} TON`) : "2.5 TON",
      edition: item.edition || "1 of 50",
      genre: item.genre || "Music NFT",
      badge: item.rarity === "Legendary" ? "EXCLUSIVE" : "LIMITED",
      imageUrl: item.imageUrl || item.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      audioUrl: item.audioUrl || "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
      status: "Instant Collect",
    }));

    const combined = [...baseList, ...dynamicConverted];

    if (!searchTerm.trim()) {
      if (activeCategory === "Limited Editions") {
        return combined.filter((n) => n.badge === "LIMITED" || n.edition?.includes("of 10") || n.edition?.includes("of 25"));
      }
      if (activeCategory === "New Drops") {
        return [...combined].reverse();
      }
      return combined;
    }

    const query = searchTerm.toLowerCase();
    return combined.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.artist.toLowerCase().includes(query) ||
        (n.genre && n.genre.toLowerCase().includes(query))
    );
  }, [allNFTs, searchTerm, activeCategory]);

  // Transform mock auctions into formatted AuctionData
  const liveAuctions: AuctionData[] = useMemo(() => {
    return MOCK_AUCTIONS.slice(0, 8).map((auc) => ({
      id: auc.id,
      title: auc.nft.title,
      artist: auc.nft.artist,
      artistVerified: auc.nft.artistVerified,
      highestBid: auc.currentBid,
      bidsCount: auc.bidsCount,
      endTime: auc.endsAt,
      imageUrl: auc.nft.coverUrl,
      genre: (auc.nft as any).genre,
    }));
  }, []);

  // Transform collections into formatted CollectionData with dynamic Total NFTs from Firestore NFT collection indices
  const exclusiveCollections: CollectionData[] = useMemo(() => {
    // 1. Primary curated drops on TON with dynamic NFT index counts
    const primaryFormatted: CollectionData[] = PRIMARY_COLLECTIONS.map((col, idx) => {
      const dynamicTotal = collectionNFTCounts[col.id] || col.totalSupply || col.items?.length || col.nftIds?.length || 12;
      return {
        id: col.id,
        name: col.name,
        creator: col.creatorName,
        creatorVerified: col.verified,
        itemCount: dynamicTotal,
        totalNFTs: dynamicTotal,
        imageUrl: col.coverUrl,
        badge: idx === 0 ? "GENESIS DROP" : idx === 1 ? "ALBUM DROP" : "CURATED",
        floorPrice: `${col.floorPrice} TON`,
      };
    });

    // 2. Additional collections from marketplace catalog with dynamic NFT index counts
    const mockFormatted: CollectionData[] = MOCK_COLLECTIONS.slice(0, 6).map((col) => {
      const dynamicTotal = collectionNFTCounts[col.id] || col.itemCount || 10;
      return {
        id: col.id,
        name: col.name,
        creator: col.creator,
        creatorVerified: col.verified,
        itemCount: dynamicTotal,
        totalNFTs: dynamicTotal,
        imageUrl: col.imageUrl,
        badge: "EXCLUSIVE",
        floorPrice: `${col.floorPrice} TON`,
      };
    });

    // Deduplicate by ID
    const seenIds = new Set<string>();
    const merged: CollectionData[] = [];
    for (const item of [...primaryFormatted, ...mockFormatted]) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        merged.push(item);
      }
    }
    return merged.slice(0, 8);
  }, [collectionNFTCounts]);

  // Audio preview playback handler
  const handlePlayPreview = (nft: MusicNFTData) => {
    if (currentTrack?.id === nft.id) {
      togglePlay();
    } else {
      playTrack({
        id: nft.id,
        title: nft.title,
        artist: nft.artist,
        artwork: nft.imageUrl,
        coverUrl: nft.imageUrl,
        audioUrl: nft.audioUrl || "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
        duration: 180,
        isNFT: true,
        price: typeof nft.price === "number" ? `${nft.price} TON` : nft.price,
      } as any);
    }
  };

  const handleConnectWallet = () => {
    if (tonConnectUI) {
      try {
        tonConnectUI.openModal();
      } catch (err) {
        console.warn("[MarketplacePage] TON Connect modal error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070D20] text-[#F5F8FF] pb-36 pt-2 px-0 sm:px-4 md:px-8 max-w-7xl mx-auto space-y-7">
      {/* 2. SCREEN HEADER */}
      <MarketplaceHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* 3. MARKETPLACE CATEGORY FILTERS */}
      <div className="px-4 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <FilterPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* 5. TRENDING MUSIC NFTs — HORIZONTAL CAROUSEL */}
      {activeCategory !== "Auctions" && (
        <section aria-labelledby="trending-nfts-heading">
          <MarketplaceSectionHeader
            title="Trending Music NFTs"
            supportingLabel="Collect what moves you."
            actionText="See all"
            onAction={() => navigate("/trending-nfts")}
          />

          {/* CRITICAL: Horizontal scrolling carousel with next card peek */}
          {isLoading ? (
            <CarouselSkeletonList type="nft" count={4} />
          ) : (
            <div className="overflow-x-auto scrollbar-none snap-x snap-mandatory flex gap-4 px-4 sm:px-0 pb-3">
              {trendingNFTs.map((nft) => (
                <MusicNFTCard
                  key={nft.id}
                  nft={nft}
                  isPlaying={currentTrack?.id === nft.id && isPlaying}
                  onPlayPreview={handlePlayPreview}
                  onQuickBuy={(item) => setQuickBuyNFT(item)}
                  onCollect={(item) => setQuickBuyNFT(item)}
                  onViewNFT={(item) => navigate(`/nft/${item.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6. LIVE AUCTIONS — HORIZONTAL CAROUSEL */}
      {activeCategory !== "Limited Editions" && activeCategory !== "New Drops" && (
        <section aria-labelledby="live-auctions-heading">
          <MarketplaceSectionHeader
            title="Live Auctions"
            supportingLabel="Real-time master bidding on 1/1 recordings."
            actionText="See all"
            onAction={() => navigate("/auctions")}
          />

          {/* CRITICAL: Horizontal scrolling carousel with next card peek */}
          <div className="overflow-x-auto scrollbar-none snap-x snap-mandatory flex gap-4 px-4 sm:px-0 pb-3">
            {liveAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onPlaceBid={(auc) => navigate(`/nft/${auc.id}`)}
                onView={(auc) => navigate(`/nft/${auc.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. EXCLUSIVE COLLECTIONS — HORIZONTAL CAROUSEL */}
      {activeCategory === "All" && (
        <section aria-labelledby="exclusive-collections-heading">
          <MarketplaceSectionHeader
            title="Exclusive Collections"
            supportingLabel="Curated compilation drops and genesis series."
            actionText="See all"
            onAction={() => navigate("/collections")}
          />

          {/* CRITICAL: Horizontal scrolling carousel with next card peek */}
          {isLoading ? (
            <CarouselSkeletonList type="collection" count={4} />
          ) : (
            <div className="overflow-x-auto scrollbar-none snap-x snap-mandatory flex gap-4 px-4 sm:px-0 pb-3">
              {exclusiveCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onView={(col) => navigate(`/collections/${col.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 8. MARKETPLACE TRANSPARENCY */}
      <div className="px-4 sm:px-0 pt-2">
        <MarketplaceTransparency
          onConnectWallet={handleConnectWallet}
          isWalletConnected={isWalletConnected}
        />
      </div>

      {/* Compact Centered Quick Buy Modal without navigating away from the marketplace */}
      <QuickBuyNFTModal
        isOpen={Boolean(quickBuyNFT)}
        onClose={() => setQuickBuyNFT(null)}
        nft={quickBuyNFT}
      />
    </div>
  );
}
