import React from 'react';
import './HeaderSection.css';

const HeaderSection = () => {
  return (
    <div className="header-section">
      <div className="header-left">
        <img src="/icon-tonjam.png" alt="TonJam Logo" className="logo" />
        <h1 className="app-name">TonJam</h1>
      </div>
      <div className="header-right">
        <button className="earn-btn">Earn TJ</button>
        <img src="/icon-user.png" alt="User" className="profile-icon" />
      </div>
    </div>
  );
};

export default HeaderSection;
