import React, { useState } from 'react';
import './NFTCard.css';

interface NFTData {
  id: string;
  title: string;
  artist: string;
  image: string;
  audio: string;
}

interface Props {
  nft: NFTData;
}

const NFTCard: React.FC<Props> = ({ nft }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(nft.audio));

  const handlePlay = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handleMint = () => {
    setIsMinting(true);

    const storedNFTs = JSON.parse(localStorage.getItem('mintedNFTs') || '[]');
    const updatedNFTs = [...storedNFTs, nft];
    localStorage.setItem('mintedNFTs', JSON.stringify(updatedNFTs));

    setTimeout(() => {
      alert(`${nft.title} minted successfully!`);
      setIsMinting(false);
    }, 1500);
  };

  return (
    <div className="nft-card">
      <img src={nft.image} alt={nft.title} className="nft-thumbnail" onClick={handlePlay} />
      <div className="nft-title">{nft.title}</div>
      <div className="nft-artist">{nft.artist}</div>
      <div className="nft-actions">
        <button className="nft-play-btn" onClick={handlePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="nft-mint-btn" onClick={handleMint} disabled={isMinting}>
          {isMinting ? 'Minting...' : 'Mint'}
        </button>
      </div>
    </div>
  );
};

export default NFTCard;
