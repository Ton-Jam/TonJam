import React, { useState } from 'react';
import './BottomNavBar.css';

const navItems = [
  { name: 'tonjam', icon: '/icon-tonjam.png', title: 'Jam Up' },
  { name: 'search', icon: '/icon-search.png', title: 'Search' },
  { name: 'space', icon: '/icon-space.png', title: 'Space' },
  { name: 'library', icon: '/icon-library.png', title: 'Library' },
  { name: 'nft', icon: '/icon-nft.png', title: 'NFTs' },
];

function BottomNavBar() {
  const [active, setActive] = useState('tonjam');

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = active === item.name;
        const isTonjam = item.name === 'tonjam';
        return (
          <div
            key={item.name}
            className={`nav-item ${isActive ? 'active' : ''} ${isTonjam ? 'tonjam-icon' : ''}`}
            onClick={() => setActive(item.name)}
          >
            <img src={item.icon} alt={item.title} className="nav-icon" />
            <span className="nav-title">{item.title}</span>
          </div>
        );
      })}
    </div>
  );
}

export default BottomNavBar;
