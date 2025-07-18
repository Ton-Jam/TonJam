import React from "react";
import "./TrendingNFTSection.css";

const trendingNFTs = [
  {
    id: 1,
    title: "Night",
    image: "/wayne.png",
    price: "120",
  },
  {
    id: 2,
    title: "Blessed",
    image: "/drake.png",
    price: "200",
  },
  {
    id: 3,
    title: "Calling",
    image: "/kalifa.png",
    price: "300",
  },
  {
    id: 4,
    title: "Rolling",
    image: "/burna.png",
    price: "350",
  },
];

const TrendingNFTSection = () => {
  return (
    <section className="trending-nft-section">
      <h2 className="trending-nft-title">🔥 Trending NFTs</h2>
      <div className="trending-nft-row">
        {trendingNFTs.map((nft) => (
          <div key={nft.id} className="nft-card">
            <img src={nft.image} alt={nft.title} className="nft-image" />
            <div className="nft-info">
              <div className="nft-title">{nft.title}</div>
              <div className="nft-bottom">
                <div className="nft-price">
                  <img src="/ton-icon.png" alt="TON" className="ton-icon" />
                  {nft.price}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingNFTSection;
