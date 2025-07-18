// NFTMarketScreen.tsx
import React from "react";
import NFTCard from "../components/NFTCard";
import "./NFTMarketScreen.css";

const mockNFTs = [
  { id: 1, title: "MoonJam", artist: "Kross", image: "/snoopy.png", price: "3 TON", audioUrl: "/mock.mp3" },
  { id: 2, title: "StarDrop", artist: "Dre", image: "/drake.png", price: "2 TON", audioUrl: "/mock.mp3" },
];

const NFTMarketScreen = () => {
  return (
    <div className="nft-market-screen">
      <h2>NFT Marketplace</h2>
      <div className="nft-grid">
        {mockNFTs.map((nft) => (
          <NFTCard key={nft.id} {...nft} />
        ))}
      </div>
    </div>
  );
};

export default NFTMarketScreen;
