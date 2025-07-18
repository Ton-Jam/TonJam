import React, { useState } from "react";
import "./DownloadSettingsScreen.css";

const DownloadSettingsScreen = () => {
  const [downloadOverWiFi, setDownloadOverWiFi] = useState(true);
  const [audioQuality, setAudioQuality] = useState("high");
  const [storageLocation, setStorageLocation] = useState("internal");

  return (
    <div className="download-settings-screen">
      <h2 className="settings-title">💾 Download Settings</h2>

      <div className="settings-section">
        <label>Download Over Wi-Fi Only</label>
        <div className="toggle-option">
          <input
            type="checkbox"
            checked={downloadOverWiFi}
            onChange={(e) => setDownloadOverWiFi(e.target.checked)}
          />
          <span>{downloadOverWiFi ? "Enabled" : "Disabled"}</span>
        </div>
      </div>

      <div className="settings-section">
        <label>Audio Quality</label>
        <select
          value={audioQuality}
          onChange={(e) => setAudioQuality(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="standard">Standard</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="settings-section">
        <label>Storage Location</label>
        <select
          value={storageLocation}
          onChange={(e) => setStorageLocation(e.target.value)}
        >
          <option value="internal">Internal Storage</option>
          <option value="sdcard">SD Card</option>
        </select>
      </div>
    </div>
  );
};

export default DownloadSettingsScreen;
