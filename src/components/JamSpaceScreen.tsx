// JamSpaceScreen.tsx import React, { useContext, useEffect, useState } from "react"; import "./JamSpaceScreen.css"; import { UserContext } from "../context/UserContext"; import { GlobalPlayerContext } from "../context/GlobalPlayerContext"; import FeedCard from "../components/FeedCard"; import FloatingPostButton from "../components/FloatingPostButton"; import PostModal from "../components/PostModal"; import EmojiPicker from "../components/EmojiPicker"; import SkeletonFeed from "../components/SkeletonFeed";

const mockFeeds = [ { id: 1, user: "Tonikz", avatar: "/artist6.png", content: "Just dropped a new jam on TON! Check it out!", image: "/feed1.png", reactions: { fire: 25, love: 10, laugh: 3 }, timestamp: "2m ago", }, { id: 2, user: "Kray", avatar: "/artist4.png", content: "Vibe to this summer drop ☀️", image: "/feed2.png", reactions: { fire: 15, love: 22, laugh: 5 }, timestamp: "10m ago", }, ];

const JamSpaceScreen = () => { const { user } = useContext(UserContext); const { currentTrack } = useContext(GlobalPlayerContext); const [showModal, setShowModal] = useState(false); const [loading, setLoading] = useState(true); const [feeds, setFeeds] = useState([]);

useEffect(() => { const timer = setTimeout(() => { setFeeds(mockFeeds); setLoading(false); }, 1000); return () => clearTimeout(timer); }, []);

return ( <div className="jam-space-screen"> <header className="jam-header"> <h2>Jam Space</h2> </header>

{loading ? (
    <>
      <SkeletonFeed />
      <SkeletonFeed />
    </>
  ) : (
    <div className="feed-list">
      {feeds.map((post) => (
        <FeedCard key={post.id} {...post} />
      ))}
    </div>
  )}

  {showModal && <PostModal onClose={() => setShowModal(false)} />}
  <FloatingPostButton onClick={() => setShowModal(true)} />
</div>

); };

export default JamSpaceScreen;
