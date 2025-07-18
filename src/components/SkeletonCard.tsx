import React from "react";
import "./SkeletonCard.css";

interface SkeletonCardProps {
  type?: "track" | "nft" | "album" | "playlist" | "artist";
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ type = "track" }) => {
  const baseClass = `skeleton-card skeleton-${type}`;

  return (
    <div className={baseClass}>
      <div className="skeleton-image" />
      {type !== "artist" && <div className="skeleton-text short" />}
      <div className="skeleton-text" />
    </div>
  );
};

export default SkeletonCard;
