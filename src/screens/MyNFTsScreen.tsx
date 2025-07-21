import React, { useEffect, useState } from 'react';
import './MyNFTsScreen.css';

interface NFT {
  id: string;
  title: string;
  artist: string;
  cover: string;
  ipfsUrl: string;
}

const MyNFTsScreen: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const mockNFTs = [
      {
        id: '1',
        title: 'Midnight Rhythm',
        artist: 'Krusher Krupy',
        cover: '/nft1.png',
        ipfsUrl: 'https://ipfs.io/ipfs/QmExample1',
      },
      {
        id: '2',
        title: 'Crystal Dreams',
        artist: 'Krusher Krupy',
        cover: '/nft2.png',
        ipfsUrl: 'https://ipfs.io/ipfs/QmExample2',
      },
    ];

    setNfts(mockNFTs);
  }, []);

  return (
    <div className="my-nfts-container">
      <h2 className="my-nfts-header">My NFT Collection</h2>
      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={nft.id} className="nft-card">
            <img src={nft.cover} alt={nft.title} className="nft-cover" />
            <div className="nft-info">
              <h4>{nft.title}</h4>
              <p>By {nft.artist}</p>
              <a href={nft.ipfsUrl} target="_blank" rel="noopener noreferrer">
                View on IPFS
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyNFTsScreen;
