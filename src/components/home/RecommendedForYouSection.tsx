import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import TrackCard from "@/components/TrackCard";
import NFTCard from "@/components/NFTCard";
import { MOCK_TRACKS } from "@/constants";
import { NFTItem } from "@/types";

const STATIC_RECOMMENDED_NFTS = [
  { id: "nft-r1", title: "Deep Oceans #04", price: "4.5 TON", owner: "Echo Phase", cover: "https://image.pollinations.ai/prompt/deep%20underwater%20abyss%20glowing%20ocean%20album%20art?width=300&height=300&nologo=true" },
  { id: "nft-r2", title: "Solar Drift Signature", price: "12.0 TON", owner: "DJ Krupy", cover: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=300&height=300&nologo=true" },
  { id: "nft-r3", title: "Cosmic Gate Keyframe", price: "2.8 TON", owner: "Luna Ray", cover: "https://image.pollinations.ai/prompt/galaxy%20retro%20organ%20scifi%20music%20album%20art?width=300&height=300&nologo=true" }
];

export const RecommendedForYouSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks } = useAudio();
  const scrollRef = useRef<HTMLDivElement>(null);

  const recommendedTracks = useMemo(() => {
    return (allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS).slice(1, 6);
  }, [allTracks]);

  const mappedRecommendedNFTs: NFTItem[] = useMemo(() => {
    return STATIC_RECOMMENDED_NFTS.map(nft => ({
      id: nft.id,
      trackId: "",
      title: nft.title,
      owner: nft.owner,
      creator: nft.owner,
      artist: nft.owner,
      price: nft.price,
      imageUrl: nft.cover,
      coverUrl: nft.cover,
      edition: "Limited Edition",
      type: "track",
      url: "",
    } as any));
  }, []);

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Recommended For Your Vibe
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=Recommended+For+You&filter=recommended")} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-0.5 w-full"
        style={{ scrollBehavior: 'smooth' }}
      >
        {recommendedTracks.map((rec) => (
          <TrackCard 
            key={rec.id} 
            track={rec} 
            variant="default" 
            className="w-[150px] sm:w-[165px] shrink-0" 
          />
        ))}

        {mappedRecommendedNFTs.map((nft) => (
          <NFTCard 
            key={nft.id} 
            nft={nft} 
            variant="default" 
            className="w-[150px] sm:w-[165px] shrink-0" 
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendedForYouSection;
