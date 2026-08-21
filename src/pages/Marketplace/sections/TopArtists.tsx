import React from "react";
import { TopArtistsSection } from "@/components/TopArtistsSection";
import { LeaderboardUser } from "../types";

interface TopArtistsProps {
  artists?: LeaderboardUser[];
  onSelectArtist?: (artist: LeaderboardUser) => void;
}

export const TopArtists: React.FC<TopArtistsProps> = () => {
  return (
    <div className="w-full text-left" id="marketplace-top-artists">
      <TopArtistsSection 
        title="Top Marketplace Artists"
        limit={10}
        showFilters={true}
      />
    </div>
  );
};

export default TopArtists;
