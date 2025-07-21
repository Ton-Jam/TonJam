import React, { useEffect, useState } from 'react';
import './NFTMarketplaceScreen.css';
import { supabase } from '../utils/supabaseClient';

interface NFTItem {
  id: string;
  title: string;
  image_url: string;
  price: string;
  owner: string;
}

const NFTMarketplaceScreen: React.FC = () => {
  const [nfts, setNFTs] = useState<NFTItem[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      const { data, error } = await supabase.from('nfts').select('*');
      if (error) console.error('Error fetching NFTs:', error);
      else setNFTs(data);
    };

    fetchNFTs();
  }, []);

  const connectWallet = () => {
    // Mock TON wallet connect logic
    setWalletConnected(true);
  };

  return (
    <div className="nft-marketplace-container">
      <div className="marketplace-header">
        <h2>Explore NFT Marketplace</h2>
        <button className="wallet-button" onClick={connectWallet}>
          {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </div>

      <div className="nft-grid">
        {nfts.length === 0 ? (
          <p className="empty-msg">No NFTs found.</p>
        ) : (
          nfts.map((nft) => (
            <div key={nft.id} className="nft-card">
              <img src={nft.image_url} alt={nft.title} className="nft-image" />
              <div className="nft-info">
                <h3>{nft.title}</h3>
                <p>Owner: {nft.owner}</p>
                <p className="price-tag">Price: {nft.price} TON</p>
                <button className="mint-btn">Buy NFT</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NFTMarketplaceScreen;
