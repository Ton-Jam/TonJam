import React from "react";
import FeaturedArtists from "@/components/FeaturedArtists";

export const FeaturedArtistsSection: React.FC = () => {
  return (
    <section className="w-full text-left">
      <FeaturedArtists />
    </section>
  );
};

export default FeaturedArtistsSection;
