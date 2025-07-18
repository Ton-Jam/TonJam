// src/screens/ArtistListScreen.tsx
import React from "react";
import ArtistListCard from "../components/ArtistListCard";
import "./ArtistListScreen.css";

const mockArtists = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: `Artist ${i + 1}`,
  profilePic: "/image.png",
  isVerified: i % 2 === 0,
  followers: 5000 + i * 1200,
}));

const ArtistListScreen = () => {
  return (
    <div className="artist-list-screen">
      <h2 className="artist-list-title">Trending Artists</h2>
      <div className="artist-list-container">
        {mockArtists.map((artist) => (
          <ArtistListCard key={artist.id} {...artist} />
        ))}
      </div>
    </div>
  );
};

export default ArtistListScreen;
