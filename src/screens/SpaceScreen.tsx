// JamSpaceScreen.tsx import React, { useState, useContext, useEffect } from "react"; import { UserContext } from "../context/UserContext"; import { GlobalPlayerContext } from "../context/GlobalPlayerContext"; import "./JamSpaceScreen.css";

const mockPosts = [ { id: 1, user: "@drake", avatar: "/drake.png", content: "Check out my new drop! #NewMusic", reactions: { "🔥": 12, "❤️": 5 }, media: "/mock.mp3", }, { id: 2, user: "@sza", avatar: "/sza.png", content: "Feeling this vibe tonight 🎧", reactions: { "🎵": 8, "🔥": 6 }, media: "", }, ];

const emojiOptions = ["🔥", "❤️", "🎵", "👏", "😂"];

const JamSpaceScreen = () => { const { user } = useContext(UserContext); const { play } = useContext(GlobalPlayerContext); const [posts, setPosts] = useState(mockPosts);

const handleReaction = (postId, emoji) => { setPosts(prev => prev.map(post => { if (post.id === postId) { const updatedReactions = { ...post.reactions, [emoji]: (post.reactions[emoji] || 0) + 1, }; return { ...post, reactions: updatedReactions }; } return post; }) ); };

return ( <div className="jamspace-screen"> <div className="jamspace-header">Jam Space</div>

<div className="jamspace-feed">
    {posts.map(post => (
      <div key={post.id} className="jamspace-post">
        <div className="post-user">
          <img src={post.avatar} className="avatar" />
          <span className="username">{post.user}</span>
        </div>
        <div className="post-content">{post.content}</div>
        {post.media && (
          <button className="play-btn" onClick={() => play(post.media)}>▶️ Play</button>
        )}
        <div className="post-reactions">
          {emojiOptions.map(emoji => (
            <button
              key={emoji}
              className="reaction-btn"
              onClick={() => handleReaction(post.id, emoji)}
            >
              {emoji} {post.reactions[emoji] || 0}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>

); };

export default JamSpaceScreen;

