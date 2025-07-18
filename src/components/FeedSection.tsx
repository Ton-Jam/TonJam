import React, { useEffect, useRef } from "react";
import "./FeedSection.css";

const FeedSection = ({ feeds }: { feeds: { id: number; image: string }[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="section">
      <div className="section-header">
        <h3>Sponsored Jam Feeds</h3>
      </div>
      <div className="scroll-row auto-scroll" ref={scrollRef}>
        {feeds.map(feed => (
          <div key={feed.id} className="feed-card">
            <img src={feed.image} alt="Sponsored" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedSection;
