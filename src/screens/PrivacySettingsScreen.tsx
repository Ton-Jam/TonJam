import React, { useState } from "react";
import "./PrivacySettingsScreen.css";

const PrivacySettingsScreen = () => {
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [messageRequests, setMessageRequests] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);

  return (
    <div className="privacy-settings-screen">
      <h2 className="privacy-header">🛡️ Privacy Settings</h2>

      <div className="toggle-row">
        <span>Show My Profile Publicly</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={profileVisible}
            onChange={() => setProfileVisible(!profileVisible)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="toggle-row">
        <span>Show Online Status</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={activityStatus}
            onChange={() => setActivityStatus(!activityStatus)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="toggle-row">
        <span>Allow Message Requests</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={messageRequests}
            onChange={() => setMessageRequests(!messageRequests)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="toggle-row">
        <span>Personalized Data Collection</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={dataCollection}
            onChange={() => setDataCollection(!dataCollection)}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
};

export default PrivacySettingsScreen;
