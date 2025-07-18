// src/screens/SpotifyLoginScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const SpotifyLoginScreen = () => {
  const navigate = useNavigate();

  const handleMockLogin = () => {
    // Mock Spotify verification logic
    localStorage.setItem("isVerified", "true");
    navigate("/profile");
  };

  return (
    <div className="spotify-login-screen">
      <h2>Connect to Spotify</h2>
      <p>Login to verify your artist profile.</p>
      <button className="connect-btn" onClick={handleMockLogin}>
        <img src="/spotify-icon.png" alt="Spotify" style={{ width: "24px", marginRight: "8px" }} />
        Continue with Spotify
      </button>
    </div>
  );
};

export default SpotifyLoginScreen;
