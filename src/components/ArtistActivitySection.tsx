import React from 'react';
import { Post } from '@/types';
import SocialFeed from '@/components/SocialFeed';

interface ArtistActivitySectionProps {
  artistPosts: Post[];
}

const ArtistActivitySection: React.FC<ArtistActivitySectionProps> = ({
  artistPosts,
}) => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <SocialFeed posts={artistPosts} emptyMessage="Signal void detected." />
    </div>
  );
};

export default ArtistActivitySection;
