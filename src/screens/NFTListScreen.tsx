// src/screens/NFTListScreen.tsx
import React from "react";
import NFTCard from "../components/NFTCard";
import "./NFTListScreen.css";

const mockNFTs = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  title: `NFT Song ${i + 1}`,
  artist: `Artist ${i + 1}`,
  image: "/image.png",
  priceTon: (i + 1) * 2,
}));

const NFTListScreen = () => {
  return (
    <div className="nft-list-screen">
      <h2 className="nft-list-title">Trending NFTs</h2>
      <div className="nft-list-container">
        {mockNFTs.map((nft) => (
          <NFTCard key={nft.id} {...nft} />
        ))}
      </div>
    </div>
  );
};

export default NFTListScreen;
