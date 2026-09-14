import React from "react";
import NFTExplorer from "@/components/NFTExplorer";

export const NFTExplorerSection: React.FC = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 text-left">
      <NFTExplorer />
    </section>
  );
};

export default NFTExplorerSection;
