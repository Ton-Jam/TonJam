// src/screens/ArtistsFollowedScreen.tsx
import React from "react";
import { useFollow } from "../context/FollowContext";
import ArtistCard from "../components/ArtistCard";
import "./ArtistsFollowedScreen.css";

const ArtistsFollowedScreen = () => {
  const { followedArtists } = useFollow();

  return (
    <div className="followed-screen">
      <h2>Your Followed Artists</h2>
      <div className="artist-list">
        {followedArtists.length === 0 ? (
          <p>No followed artists yet.</p>
        ) : (
          followedArtists.map(artist => <ArtistCard key={artist.id} {...artist} />)
        )}
      </div>
    </div>
  );
};

export default ArtistsFollowedScreen;
