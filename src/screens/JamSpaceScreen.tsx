import React, { useState } from 'react';
import './JamSpaceScreen.css';
import { jamPosts } from '../mock/jamPosts';
import JamPostCard from '../components/JamPostCard';
import JamPostInput from '../components/JamPostInput';

const JamSpaceScreen = () => {
  const [posts, setPosts] = useState(jamPosts);

  const handleNewPost = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="jam-space-screen">
      <h2>Jam Space</h2>
      <JamPostInput onPost={handleNewPost} />
      <div className="jam-posts-list">
        {posts.map((post, index) => (
          <JamPostCard key={index} post={post} />
        ))}
      </div>
    </div>
  );
};

export default JamSpaceScreen;
