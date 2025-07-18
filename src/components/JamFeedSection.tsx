// In JamFeedSection.tsx or HomeScreen.tsx
import React, { useState } from 'react';
import NFTModal from './NFTModal';

const JamFeedSection = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const mockPosts = [
    {
      title: 'Track One',
      artist: 'Krusher',
      type: 'track',
      coverImage: '/mock1.png',
      audioUrl: '/track1.mp3',
    },
    {
      title: 'Exclusive NFT',
      artist: 'Blaze',
      type: 'nft',
      coverImage: '/mock2.png',
      price: '12 TON',
    },
  ];

  const openModal = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  return (
    <div>
      <h3>Jam Feeds</h3>
      <div className="feed-cards">
        {mockPosts.map((post, index) => (
          <div
            key={index}
            className="feed-card"
            onClick={() => openModal(post)}
          >
            <img src={post.coverImage} alt={post.title} />
            <h4>{post.title}</h4>
            <p>{post.artist}</p>
          </div>
        ))}
      </div>

      <NFTModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
      />
    </div>
  );
};

export default JamFeedSection;
