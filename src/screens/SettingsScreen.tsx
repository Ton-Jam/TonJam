// src/screens/SettingsScreen/SettingsScreen.tsx
import React from "react";
import "./SettingsScreen.css";

const SettingsScreen = () => {
  return (
    <div className="settings-screen">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>🎨 Theme</h3>
        <button className="theme-toggle">Toggle Dark / Light</button>
      </div>

      <div className="settings-section">
        <h3>🧑 Profile</h3>
        <button className="profile-button">Go to Profile</button>
      </div>

      <div className="settings-section">
        <h3>🎧 Spotify Artist Verification</h3>
        <button className="spotify-button">Verify with Spotify</button>
      </div>

      <div className="settings-section">
        <h3>💼 Wallet</h3>
        <button className="wallet-button">Connect Wallet</button>
      </div>

      <div className="settings-section">
        <h3>⚙️ More Options</h3>
        <button className="logout-button">Logout</button>
      </div>
    </div>
  );
};

export default SettingsScreen;
