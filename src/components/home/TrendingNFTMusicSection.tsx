import React from "react";
import { TrendingTracksSection } from "@/components/search/TrendingTracksSection";

export const TrendingNFTMusicSection: React.FC = () => {
  return (
    <section className="w-full text-left">
      <TrendingTracksSection 
        title="Trending NFT Audio Artifacts"
        subtitle="High-performing Web3 audio artifacts synced directly from TON marketplace"
      />
    </section>
  );
};

export default TrendingNFTMusicSection;
