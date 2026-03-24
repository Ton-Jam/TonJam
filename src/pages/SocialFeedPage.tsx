import React from 'react';
import SocialFeed from '@/components/SocialFeed';
import { useAudio } from '@/context/AudioContext';

const SocialFeedPage: React.FC = () => {
  const { posts } = useAudio();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Social Feed</h1>
      <SocialFeed posts={posts} />
    </div>
  );
};

export default SocialFeedPage;
