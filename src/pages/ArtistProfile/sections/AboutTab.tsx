import * as React from "react";
import { Artist } from "@/types";
import { Award, Globe, Music, MapPin, Calendar, Heart, ShieldAlert, Star } from "lucide-react";

interface AboutTabProps {
  artist: Artist;
}

export const AboutTab: React.FC<AboutTabProps> = ({ artist }) => {
  return (
    <div className="space-y-10 animate-in fade-in max-w-3xl" id="about-tab-root">
      
      {/* Expanded Biography */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-white font-sans">Full Story</h3>
        <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
          {artist.bio || "This verified artist is shaping the future of web3 audio and decentralized NFT master rights. Join their exclusive fan club to see behind the scenes."}
        </p>
      </section>

      {/* Influences & Creative Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-neutral-900">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Music className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-[0.15em]">Musical Parameter & Genres</h4>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs font-semibold bg-neutral-900 border border-neutral-800 text-white px-3 py-1 rounded-full">
              {artist.genre || "Electronic"}
            </span>
            <span className="text-xs font-semibold bg-neutral-900 border border-neutral-800 text-white px-3 py-1 rounded-full">
              Techno-Synth
            </span>
            <span className="text-xs font-semibold bg-neutral-900 border border-neutral-800 text-white px-3 py-1 rounded-full">
              Web3 Generative
            </span>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Heart className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-[0.15em]">Key Influences</h4>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs font-semibold bg-neutral-900 border border-neutral-800 text-white px-3 py-1 rounded-full">
              Daft Punk
            </span>
            <span className="text-xs font-semibold bg-neutral-900 border border-neutral-800 text-white px-3 py-1 rounded-full">
              Aphex Twin
            </span>
            <span className="text-xs font-semibold bg-neutral-900 border border-neutral-800 text-white px-3 py-1 rounded-full">
              Kraftwerk
            </span>
          </div>
        </section>
      </div>

      {/* Accolades & Accolade Badges */}
      <section className="space-y-4 pt-6 border-t border-neutral-900">
        <div className="flex items-center gap-2 text-amber-400">
          <Award className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-[0.15em]">Verified Accolades</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-neutral-900/30 p-4 rounded-[10px] flex gap-3">
            <Star className="w-8 h-8 text-amber-400 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">TonJam NFT Innovator 2026</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Acknowledged for publishing the first fully decentralized multitrack audio ledger with real-time royalty splits.</p>
            </div>
          </div>

          <div className="bg-neutral-900/30 p-4 rounded-[10px] flex gap-3">
            <Award className="w-8 h-8 text-cyan-400 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Top Charted Electronic Curator</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Held #1 spot in top trending TON streaming pools for 12 consecutive weeks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meta Specifications */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-neutral-900">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Record Label</span>
          <p className="font-bold text-sm text-white">TJ Independent Node</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Joined Registry</span>
          <p className="font-bold text-sm text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" /> Mar 2024
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Ledger State</span>
          <p className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 uppercase text-[10px] tracking-widest font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified Active
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Main Anchor</span>
          <p className="font-bold text-sm text-white flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-500" /> {artist.location || 'Cyber Space'}
          </p>
        </div>
      </section>
    </div>
  );
};
