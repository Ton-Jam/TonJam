import React from 'react';
import './ProfileScreen.css';

const userData = {
  name: 'TonJam TON',
  isSpotifyVerified: true,
};

const ProfileScreen = ({ closePage }: { closePage: () => void }) => {
  const MenuItem = ({ icon, title, subtitle }: { icon: string, title:string, subtitle?: string }) => (
    <div className="menu-item">
      <img src={icon} alt={title} className="menu-item-icon" />
      <div className="menu-item-text">
        <h4>{title}</h4>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <span className="menu-item-arrow">&gt;</span>
    </div>
  );

  return (
    <div className="profile-screen-new">
      <header className="profile-header-new">
        <button className="icon-button" onClick={closePage}>
          <img src="/icon-back.png" alt="Back" />
        </button>
        <h1>My Account</h1>
        <button className="icon-button">
          <img src="/icon-settings.png" alt="Settings" />
        </button>
      </header>

      <div className="user-info-card">
        <div className="user-icon-container">
          <img src="/icon-ton-diamond.png" alt="User Icon" className="user-icon" />
          {userData.isSpotifyVerified && (
            <img src="/icon-verified-check.png" alt="Verified" className="verified-badge" />
          )}
        </div>
        <h2>{userData.name}</h2>
        <span className="user-info-arrow">&gt;</span>
      </div>

      <div className="menu-list">
        <MenuItem 
          icon="/icon-store.png" 
          title="Jam Store" 
          subtitle="Redeem Rewards with TJ points" 
        />
        <MenuItem 
          icon="/icon-space-post.png" 
          title="My Posts on Space" 
        />
        {!userData.isSpotifyVerified && (
           <MenuItem 
             icon="/icon-artist.png" 
             title="TonJam For Artists" 
             subtitle="Verify to start minting"
           />
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
