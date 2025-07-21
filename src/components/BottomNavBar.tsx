// src/components/BottomNavBar.tsx
import React from 'react';
import './BottomNavBar.css';

function BottomNavBar() {
  return (
    <div className="bottom-nav">
      <img src="/icon-tonjam.png" alt="Jam Up" />
      <img src="/icon-search.png" alt="Search" />
      <img src="/icon-space.png" alt="Space" />
      <img src="/icon-library.png" alt="Library" />
      <img src="/icon-nft.png" alt="NFTs" />
    </div>
  );
}

export default BottomNavBar;
