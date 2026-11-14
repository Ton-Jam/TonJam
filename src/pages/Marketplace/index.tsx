import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { Disc3, Gavel, Layers } from "lucide-react";
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
    liveAuctions: rawLiveAuctions,
    trendingCollections: rawCollections,
    isLoading,
    isWalletConnected,
    collectionNFTCounts,
  } = useMarketplace();

  const [quickBuyNFT, setQuickBuyNFT] = useState<QuickBuyNFTData | null>(null);

  const trendingNFTs: MusicNFTData[] = useMemo(() => {
    return (filteredNFTs || []).map((item: any) => ({
      id: item.id,
      title: item.title || "Untitled NFT",
      artist: item.artist || item.creator || "TonJam Artist",
      artistVerified: Boolean(item.artistVerified),
      price: item.price ? (String(item.price).includes("TON") ? item.price : `${item.price} TON`) : "0 TON",
      edition: item.edition || "1/1",
      genre: item.genre || "Music NFT",
      badge: item.rarity === "Legendary" ? "EXCLUSIVE" : item.rarity === "Rare" ? "LIMITED" : undefined,
      imageUrl: item.imageUrl || item.coverUrl || "",
      audioUrl: item.audioUrl || "",
      status: item.listingType === "auction" ? "On Auction" : "Instant Collect",
    }));
  }, [filteredNFTs]);

  const liveAuctions: AuctionData[] = useMemo(() => {
    return rawLiveAuctions.map((auc) => ({
      id: auc.id,
      title: auc.nft.title,
      artist: auc.nft.artist || auc.nft.creator || "TonJam Artist",
      artistVerified: Boolean(auc.nft.artistVerified),
      highestBid: auc.currentBid,
      bidsCount: auc.bidsCount,
      endTime: auc.endsAt,
      imageUrl: auc.nft.imageUrl || auc.nft.coverUrl || "",
      genre: (auc.nft as any).genre,
    }));
  }, [rawLiveAuctions]);

  const exclusiveCollections: CollectionData[] = useMemo(() => {
    return rawCollections.map((col) => {
      const dynamicTotal = collectionNFTCounts[col.id] ?? col.itemCount ?? 0;
      return {
        id: col.id,
        name: col.name,
        creator: col.creator,
        creatorVerified: col.verified,
        itemCount: dynamicTotal,
        totalNFTs: dynamicTotal,
        imageUrl: col.imageUrl,
        badge: "COLLECTION",
        floorPrice: col.floorPrice ? `${col.floorPrice} TON` : undefined,
      };
    });
  }, [rawCollections, collectionNFTCounts]);

  const handlePlayPreview = (nft: MusicNFTData) => {
    if (currentTrack?.id === nft.id) {
      togglePlay();
    } else if (nft.audioUrl) {
      playTrack({
        id: nft.id,
        title: nft.title,
        artist: nft.artist,
        artwork: nft.imageUrl,
        coverUrl: nft.imageUrl,
        audioUrl: nft.audioUrl,
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
    <div className="min-h-screen bg-transparent text-[#F5F8FF] pb-36 pt-2 px-0 sm:px-4 md:px-8 max-w-7xl mx-auto space-y-7">
      <MarketplaceHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

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

      {activeCategory !== "Auctions" && (
        <section aria-labelledby="trending-nfts-heading">
          <MarketplaceSectionHeader
            title="Trending Music NFTs"
            supportingLabel="Collect what moves you."
            actionText="See all"
            onAction={() => navigate("/trending-nfts")}
          />

          {isLoading ? (
            <CarouselSkeletonList type="nft" count={4} />
          ) : trendingNFTs.length === 0 ? (
            <div className="mx-4 sm:mx-0 py-10 px-6 rounded-2xl bg-white/[0.02] text-center space-y-2">
              <Disc3 className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No Music NFTs Listed Yet</p>
              <p className="text-xs text-slate-400">
                Minted audio NFTs on the TON network will appear here once published.
              </p>
            </div>
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

      {activeCategory !== "Limited Editions" && activeCategory !== "New Drops" && (
        <section aria-labelledby="live-auctions-heading">
          <MarketplaceSectionHeader
            title="Live Auctions"
            supportingLabel="Real-time master bidding on 1/1 recordings."
            actionText="See all"
            onAction={() => navigate("/auctions")}
          />

          {isLoading ? (
            <CarouselSkeletonList type="nft" count={4} />
          ) : liveAuctions.length === 0 ? (
            <div className="mx-4 sm:mx-0 py-10 px-6 rounded-2xl bg-white/[0.02] text-center space-y-2">
              <Gavel className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No Active Auctions</p>
              <p className="text-xs text-slate-400">
                Live NFT auctions from verified creators will appear here when scheduled.
              </p>
            </div>
          ) : (
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
          )}
        </section>
      )}

      {activeCategory === "All" && (
        <section aria-labelledby="exclusive-collections-heading">
          <MarketplaceSectionHeader
            title="Exclusive Collections"
            supportingLabel="Curated compilation drops and genesis series."
            actionText="See all"
            onAction={() => navigate("/collections")}
          />

          {isLoading ? (
            <CarouselSkeletonList type="collection" count={4} />
          ) : exclusiveCollections.length === 0 ? (
            <div className="mx-4 sm:mx-0 py-10 px-6 rounded-2xl bg-white/[0.02] text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No Collections Yet</p>
              <p className="text-xs text-slate-400">
                Verified music NFT collections published in Firestore will appear here.
              </p>
            </div>
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

      <div className="px-4 sm:px-0 pt-2">
        <MarketplaceTransparency
          onConnectWallet={handleConnectWallet}
          isWalletConnected={isWalletConnected}
        />
      </div>

      <QuickBuyNFTModal
        isOpen={Boolean(quickBuyNFT)}
        onClose={() => setQuickBuyNFT(null)}
        nft={quickBuyNFT}
      />
    </div>
  );
}
