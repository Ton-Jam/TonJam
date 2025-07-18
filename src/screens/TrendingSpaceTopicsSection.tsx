import React from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import "./TrendingSpaceTopicsSection.css";

const trendingTopics = [
  {
    id: 1,
    title: "What’s your best Jam of the week?",
    author: "Drixyy",
    avatar: "/drake.png",
    comments: "12k",
    likes: "22k",
  },
  {
    id: 2,
    title: "Should Artists drop more freestyles?",
    author: "wizyy",
    avatar: "/wizy.png",
    comments: "9.5k",
    likes: "17k",
  },
  {
    id: 3,
    title: "Who’s the king of Afro TON?",
    author: "Burnaa",
    avatar: "/burna.png",
    comments: "15.2k",
    likes: "30k",
  },
  {
    id: 4,
    title: "Is TON the next music revolution?",
    author: "kanyeee",
    avatar: "/kanye.png",
    comments: "7.8k",
    likes: "12k",
  },
];

const TrendingSpaceTopicsSection = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handlers = useSwipeable({
    onSwipedLeft: () => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" }),
    onSwipedRight: () => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" }),
    trackMouse: true,
  });

  const handleTopicClick = (topicId: number) => {
    navigate(`/space?scrollTo=${topicId}`);
  };

  return (
    <div className="section trending-topics-section">
      <h2 className="section-title">Trending Space Topics</h2>
      <div className="topics-container" {...handlers} ref={scrollRef}>
        {trendingTopics.map((topic) => (
          <div key={topic.id} className="topic-card" onClick={() => handleTopicClick(topic.id)}>
            <div className="topic-header">
              <img src={topic.avatar} alt={topic.author} className="topic-avatar" />
              <span className="topic-author">{topic.author}</span>
            </div>
            <div className="topic-title">{topic.title}</div>
            <div className="topic-meta">
              <span>{topic.comments} Comments</span>
              <span>{topic.likes} Likes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSpaceTopicsSection;
