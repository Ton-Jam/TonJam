
import React from 'react';
import './ArtistScreen.css';

// THIS IS WHERE YOU WILL INTEGRATE THE SPOTIFY API
const handleVerifyWithSpotify = () => {
  // IMPORTANT: This logic MUST be handled by a backend server for security.
  // The button should redirect to your backend's auth URL.
  // Example: window.location.href = 'https://your-tonjam-backend.com/auth/spotify';
  alert("This will redirect to the Spotify verification flow!");
};

const ArtistScreen = () => {
  return (
    <div className="artist-screen">
      <div className="card">
        <h2>Become a Verified Artist</h2>
        <p>Verify your identity with Spotify to unlock the ability to mint your songs as NFTs on TonJam and start earning.</p>
        <ul className="benefits-list">
          <li>✅ Get a verified checkmark on your profile.</li>
          <li>🎵 Unlock song minting capabilities.</li>
          <li>💰 Receive a 5,000 $TJ bonus upon verification.</li>
        </ul>
        <button className="spotify-button" onClick={handleVerifyWithSpotify}>
          Verify with Spotify
        </button>
      </div>
    </div>
  );
};
export default ArtistScreen;
