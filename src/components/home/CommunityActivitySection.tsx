import React from "react";
import { SocialActivityFeed } from "@/components/SocialActivityFeed";

export const CommunityActivitySection: React.FC = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 text-left">
      <SocialActivityFeed />
    </section>
  );
};

export default CommunityActivitySection;
