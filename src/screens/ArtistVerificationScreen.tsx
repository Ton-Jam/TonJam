// src/screens/ArtistVerificationScreen.tsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "./ArtistVerificationScreen.css";

const ArtistVerificationScreen = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleMockSpotifyLogin = () => {
    // Mock verified artist data
    const verifiedArtist = {
      ...user,
      isVerified: true,
      spotifyName: "Wizkid",
      spotifyId: "mock_spotify_id_123",
      profilePic: "/img/wizkid.png",
    };
    setUser(verifiedArtist);
    navigate("/profile");
  };

  return (
    <div className="artist-verification-screen">
      <h2>Get Verified as an Artist</h2>
      <p>Connect your Spotify account to verify your identity as an artist on TonJam.</p>
      <button className="spotify-button" onClick={handleMockSpotifyLogin}>
        <img src="/img/spotify-icon.png" alt="Spotify" />
        Continue with Spotify
      </button>
    </div>
  );
};

export default ArtistVerificationScreen;
