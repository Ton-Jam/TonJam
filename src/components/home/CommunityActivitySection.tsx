import React from "react";
import { SocialActivityFeed } from "@/components/SocialActivityFeed";

export const CommunityActivitySection: React.FC = () => {
  return (
    <section className="w-full text-left">
      <SocialActivityFeed />
    </section>
  );
};

export default CommunityActivitySection;
