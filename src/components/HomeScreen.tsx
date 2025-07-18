// src/screens/HomeScreen.tsx
import React, { useState } from "react";
import "./HomeScreen.css";

const HomeScreen = () => {
  const genres = ["Afrobeats", "Hip-Hop", "RnB", "Amapiano", "Drill", "Pop"];

  const [followed, setFollowed] = useState<{ [key: string]: boolean }>({});

  const toggleFollow = (artistName: string) => {
    setFollowed(prev => ({ ...prev, [artistName]: !prev[artistName] }));
  };

  const artists = [
    { name: "Jayzzz", image: "/jayz.png", followers: "1.2M" },
    { name: "Kahlifa", image: "/kalifa.png", followers: "980K" },
    { name: "Rehmaa", image: "/rema.png", followers: "1.1M" },
    { name: "Drakee", image: "/drake.png", followers: "2.3M" },
    { name: "Ayra", image: "/ayra.png", followers: "900K" }
  ];

  return (
    <div className="home-screen">
      {/* Header */}
      <div className="home-header">
        <div className="logo-area">
          <img src="/logo.png" className="tonjam-logo" alt="TonJam" />
          <span className="tonjam-title">TonJam</span>
        </div>
        <div className="header-right">
          <button className="earn-pill">Earn $TJ</button>
          <img src="/icon-user.png" className="profile-icon" alt="Profile" />
        </div>
      </div>

      {/* Welcome Message */}
      <h2 className="welcome-text">What’s up TON, Let’s Jam up!</h2>

      {/* Genre Filter */}
      <div className="genre-scroll">
        {genres.map((genre, index) => (
          <button key={index} className="genre-pill">{genre}</button>
        ))}
      </div>

      {/* Verified Artist Section */}
      <section className="section">
        <div className="section-header">
          <h3>🎤 Verified Artists</h3>
          <button className="view-all">View All</button>
        </div>
        <div className="horizontal-scroll">
          {artists.map((artist) => (
            <div className="artist-card" key={artist.name}>
              <div className="artist-avatar-wrapper">
                <img src={artist.image} alt={artist.name} className="artist-avatar" />
                <img src="/icon-verified-check.png" className="verified-badge" alt="Verified" />
              </div>
              <p className="artist-name">{artist.name}</p>
              <p className="artist-followers">{artist.followers} followers</p>
              <button className="follow-btn" onClick={() => toggleFollow(artist.name)}>
                {followed[artist.name] ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
