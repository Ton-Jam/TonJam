import React from 'react';
import SocialFeed from '@/components/SocialFeed';
import { useAudio } from '@/contexts/AudioContext';

const SocialFeedPage: React.FC = () => {
  const { posts } = useAudio();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-xl font-black uppercase tracking-tighter mb-4 text-foreground">Social Feed</h1>
      <SocialFeed posts={posts} />
    </div>
  );
};

export default SocialFeedPage;
