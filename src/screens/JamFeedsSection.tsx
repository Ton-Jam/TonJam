import React from "react";
import "./JamFeedsSection.css";

const sponsoredFeeds = [
  {
    id: 1,
    title: "Introducing TonJam to the world",
    image: "/sponsored1.png",
  },
  {
    id: 2,
    title: "New NFT Drop by Snoopy",
    image: "/sponsored3.png",
  },
  {
    id: 3,
    title: "Hello World TonJam is Here",
    image: "/sponsored2.png",
  },
  {
    id: 4,
    title: "Meet The Brain behind TonJam",
    image: "/krupy.png",
  },
];

// Repeat feeds to fill the scroll
const duplicatedFeeds = [...sponsoredFeeds, ...sponsoredFeeds, ...sponsoredFeeds];

const JamFeedsSection = () => {
  return (
    <section className="jam-feeds-section">
      <h2 className="section-title">🔥 Sponsored Jam Feeds</h2>
      <div className="jam-feeds-scroll-wrapper">
        <div className="jam-feeds-scroll">
          {duplicatedFeeds.map((feed, index) => (
            <div className="jam-feed-card" key={index}>
              <img src={feed.image} alt={feed.title} className="jam-feed-image" />
              <div className="jam-feed-info">
                <span className="jam-feed-title">{feed.title}</span>
                <button className="jam-feed-play-btn">▶ Play</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JamFeedsSection;
