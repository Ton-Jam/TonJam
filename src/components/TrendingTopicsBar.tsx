import React from "react";
import "./TrendingTopicsBar.css";

const hashtags = [
  "#JamUp",
  "#TonVibes",
  "#NFTDrop",
  "#Wizkiid",
  "#AyraStarr",
  "#Drakeee",
  "#MintNow",
  "#VibesOnly",
  "#Afrobeats",
  "#TONPower",
];

const TrendingTopicsBar = () => {
  return (
    <div className="trending-bar">
      <div className="hashtag-scroll">
        {hashtags.map((tag, index) => (
          <div className="hashtag-pill" key={index}>
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopicsBar;
