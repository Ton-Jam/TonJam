// TopicCard.tsx import React from "react"; import "./TopicCard.css";

interface TopicCardProps { imageUrl: string; title: string; tag?: string; tagColor?: string; }

const TopicCard: React.FC<TopicCardProps> = ({ imageUrl, title, tag, tagColor }) => { return ( <div className="topic-card"> <div className="topic-image-wrapper"> <img src={imageUrl} alt={title} className="topic-image" /> {tag && <span className="topic-tag" style={{ backgroundColor: tagColor }}>{tag}</span>} </div> <div className="topic-title">{title}</div> </div> ); };

export default TopicCard;


