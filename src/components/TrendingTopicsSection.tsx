import React from "react";
import "./TrendingTopicsSection.css";

const TrendingTopicsSection: React.FC = () => {
  return (
    <section className="trending-topics">
      <h2>Trending Topics in Space</h2>
      <ul>
        <li>#TONMusic</li>
        <li>#Web3Tracks</li>
      </ul>
    </section>
  );
};

export default TrendingTopicsSection;
