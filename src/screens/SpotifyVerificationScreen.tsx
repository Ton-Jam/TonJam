import React from 'react';
import './SpotifyVerificationScreen.css';

const SpotifyVerificationScreen = () => {
  const handleVerify = () => {
    alert('Artist verified successfully!');
  };

  return (
    <div className="spotify-verification-screen">
      <h2>Spotify Artist Verification</h2>
      <p>To get verified, please link your Spotify account and verify your artist profile.</p>
      <button className="verify-btn" onClick={handleVerify}>
        Verify Artist
      </button>
    </div>
  );
};

export default SpotifyVerificationScreen;
