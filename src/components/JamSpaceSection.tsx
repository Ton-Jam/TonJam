import React from 'react';
import './JamSpaceSection.css';

const jamPosts = [
  {
    id: 1,
    user: 'AfroTON Lord',
    avatar: '/Artist6.png',
    text: 'Just dropped a new banger! 🔥 Check it out!',
    image: '/drop1.png',
    likes: 82,
    comments: 10,
  },
  {
    id: 2,
    user: 'Soul Jamz',
    avatar: '/Artist3.png',
    text: 'Throwback to my first NFT drop 🚀💿',
    image: '/drop2.png',
    likes: 54,
    comments: 3,
  },
];

const JamSpaceSection = () => {
  return (
    <section className="jam-space-section">
      <h3 className="section-title">💬 Jam Space Posts</h3>
      <div className="jam-posts-list">
        {jamPosts.map((post) => (
          <div className="jam-post-card" key={post.id}>
            <div className="jam-post-header">
              <img src={post.avatar} alt={post.user} className="jam-avatar" />
              <span className="jam-user">{post.user}</span>
            </div>
            <p className="jam-text">{post.text}</p>
            <img src={post.image} alt="Post" className="jam-image" />
            <div className="jam-reactions">
              ❤️ {post.likes} 💬 {post.comments}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default JamSpaceSection;
