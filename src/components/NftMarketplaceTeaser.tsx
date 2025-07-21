import React from 'react';
import './NftMarketplaceTeaser.css';

const NftMarketplaceTeaser = () => {
  return (
    <div className="nft-marketplace-teaser">
      <div className="teaser-content">
        <h3 className="teaser-title"> Explore the NFT Marketplace</h3>
        <p className="teaser-description">
          Discover, mint, and trade exclusive music NFTs by top verified artists.
        </p>
        <a href="/nft-marketplace" className="teaser-button">
          Go to Marketplace
        </a>
      </div>
      <img
        src="/illustrations/nft-marketplace-teaser.png"
        alt="NFT Marketplace"
        className="teaser-image"
      />
    </div>
  );
};

export default NftMarketplaceTeaser;
