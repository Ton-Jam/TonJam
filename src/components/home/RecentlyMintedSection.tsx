import React from "react";
import RecentlyMintedNFTs from "@/components/RecentlyMintedNFTs";

export const RecentlyMintedSection: React.FC = () => {
  return (
    <section className="w-full text-left">
      <RecentlyMintedNFTs title="Recently Minted Music NFTs" />
    </section>
  );
};

export default RecentlyMintedSection;
