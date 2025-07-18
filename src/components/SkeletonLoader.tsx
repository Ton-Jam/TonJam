import React from "react";
import "./SkeletonLoader.css";

interface SkeletonLoaderProps {
  type: "card" | "artist" | "feed" | "album" | "playlist";
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
  const elements = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="skeleton-card">
            <div className="skeleton-img" />
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
          </div>
        );
      case "artist":
        return (
          <div className="skeleton-artist">
            <div className="skeleton-avatar" />
            <div className="skeleton-line short" />
          </div>
        );
      case "feed":
        return (
          <div className="skeleton-feed">
            <div className="skeleton-avatar small" />
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
            <div className="skeleton-img wide" />
          </div>
        );
      case "album":
      case "playlist":
        return (
          <div className="skeleton-album">
            <div className="skeleton-img square" />
            <div className="skeleton-line short" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="skeleton-wrapper">
      {elements.map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;

