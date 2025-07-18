import React, { useState } from "react";
import "./NotificationSettingsScreen.css";

const NotificationSettingsScreen = () => {
  const [musicDrops, setMusicDrops] = useState(true);
  const [nftSales, setNftSales] = useState(true);
  const [socialAlerts, setSocialAlerts] = useState(false);
  const [newsUpdates, setNewsUpdates] = useState(true);

  return (
    <div className="notification-settings-screen">
      <h2 className="notification-header">🔔 Notifications</h2>

      <div className="toggle-row">
        <span>New Music Drops</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={musicDrops}
            onChange={() => setMusicDrops(!musicDrops)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="toggle-row">
        <span>NFT Sales / Bids</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={nftSales}
            onChange={() => setNftSales(!nftSales)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="toggle-row">
        <span>Follows & Comments</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={socialAlerts}
            onChange={() => setSocialAlerts(!socialAlerts)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="toggle-row">
        <span>TonJam News & Updates</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={newsUpdates}
            onChange={() => setNewsUpdates(!newsUpdates)}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
};

export default NotificationSettingsScreen;
