import * as React from "react";
import { Track, NFTItem } from "@/types";
import { AlbumData, ArtistEvent, ArtistPost, PlaylistData } from "../types";
import { Play, Calendar, MessageSquare, Heart, ArrowRight, Share2, Award, Sparkles, Gem } from "lucide-react";
import { motion } from "motion/react";
import TrackCard from "@/components/TrackCard";

interface OverviewTabProps {
  tracks: Track[];
  nfts: NFTItem[];
  albums: AlbumData[];
  playlists: PlaylistData[];
  posts: ArtistPost[];
  events: ArtistEvent[];
  onPlayTrack: (track: Track) => void;
  onNavigateToTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  tracks,
  nfts,
  albums,
  playlists,
  posts,
  events,
  onPlayTrack,
  onNavigateToTab
}) => {
  const latestTrack = tracks[0];
  const featuredAlbum = albums[0];
  const trendingNft = nfts[0];
  const upcomingEvent = events[0];
  const latestPost = posts[0];
  const popularTracks = tracks.slice(0, 4);

  return (
    <div className="space-y-12 animate-in fade-in" id="overview-tab-root">
      
      {/* Latest Release Promo Hero */}
      {latestTrack && (
        <section className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 rounded-[10px] flex flex-col md:flex-row items-center gap-6 border border-neutral-800">
          <img 
            src={latestTrack.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"} 
            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-[10px]" 
            alt="Latest Release Cover" 
          />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px]">
                Latest Release
              </span>
              {latestTrack.isNFT && (
                <span className="bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                  <Gem className="w-2.5 h-2.5" /> Music NFT
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">{latestTrack.title}</h3>
              <p className="text-xs text-muted-foreground">Released June 2026 • {latestTrack.genre}</p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
              The revolutionary new track combining modular digital synths with deep TON network state variables. Own the rare master NFT edition to unlock streaming splits.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button 
                onClick={() => onPlayTrack(latestTrack)}
                className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 transition-colors rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer border-none"
              >
                <Play className="w-3.5 h-3.5 fill-current text-black" /> Play Song
              </button>
              
              {latestTrack.isNFT && (
                <button 
                  onClick={() => onNavigateToTab("nfts")}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-purple-400 border border-purple-500/30 transition-colors rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> View NFT Mint
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Popular Tracks list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-white uppercase tracking-widest text-[11px] text-muted-foreground">Popular Tracks</h3>
          <button 
            onClick={() => onNavigateToTab("music")}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
          >
            See All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1">
          {popularTracks.map((track, index) => (
            <div 
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="flex items-center justify-between p-3 rounded-[10px] hover:bg-neutral-900/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-4 text-xs font-semibold text-muted-foreground text-center group-hover:text-cyan-400">
                  {index + 1}
                </span>
                <img 
                  src={track.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"} 
                  className="w-10 h-10 object-cover rounded-[6px]" 
                  alt="" 
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">{track.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{track.genre}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                  {(track.playCount || 0).toLocaleString()} streams
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {Math.floor((track.duration || 200) / 60)}:{(String((track.duration || 200) % 60)).padStart(2, '0')}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="p-1.5 hover:text-red-500 text-muted-foreground transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Album & Trending NFT Side-By-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Featured Album */}
        {featuredAlbum && (
          <section className="bg-neutral-900/20 p-5 rounded-[10px] border border-neutral-900 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Featured Album</h4>
            <div className="flex gap-4">
              <img src={featuredAlbum.coverUrl} className="w-24 h-24 object-cover rounded-[10px]" alt="" />
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-bold text-white">{featuredAlbum.title}</h3>
                <p className="text-xs text-muted-foreground">{featuredAlbum.releaseYear} • {featuredAlbum.trackCount} Tracks</p>
                <div className="pt-2">
                  <button 
                    onClick={() => onNavigateToTab("albums")}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-[10px] font-bold uppercase tracking-wider"
                  >
                    Listen Album
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trending NFT */}
        {trendingNft && (
          <section className="bg-neutral-900/20 p-5 rounded-[10px] border border-neutral-900 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Trending NFT</h4>
            <div className="flex gap-4">
              <img src={trendingNft.imageUrl || trendingNft.coverUrl} className="w-24 h-24 object-cover rounded-[10px] border border-purple-500/20" alt="" />
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-bold text-white truncate">{trendingNft.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold font-mono">
                  <span>Floor: {trendingNft.price || "4.5"} TON</span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">Royalty Split: 12%</p>
                <div className="pt-2">
                  <button 
                    onClick={() => onNavigateToTab("nfts")}
                    className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-full text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer"
                  >
                    View Bid
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Recent Updates & Event Promos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latest Story */}
        <div className="lg:col-span-2 bg-neutral-900/10 p-5 rounded-[10px] border border-neutral-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Artist Update</h4>
            <button 
              onClick={() => onNavigateToTab("posts")}
              className="text-xs text-muted-foreground hover:text-white"
            >
              See Feed
            </button>
          </div>
          {latestPost && (
            <div className="space-y-3">
              <p className="text-sm text-neutral-200 leading-relaxed font-normal">{latestPost.content}</p>
              {latestPost.mediaUrl && (
                <img src={latestPost.mediaUrl} className="w-full h-40 object-cover rounded-[10px]" alt="" />
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {latestPost.likes}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {latestPost.comments}</span>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Event */}
        {upcomingEvent && (
          <div className="bg-gradient-to-b from-neutral-900/40 to-neutral-950/40 p-5 rounded-[10px] border border-neutral-900 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-[0.15em]">Next Event</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{upcomingEvent.title}</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="font-semibold text-neutral-300">{upcomingEvent.date}</p>
                <p>{upcomingEvent.time} • {upcomingEvent.venue}</p>
                <p className="font-mono text-cyan-400/80">{upcomingEvent.price}</p>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => onNavigateToTab("events")}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-bold uppercase tracking-wider"
              >
                RSVP / Tickets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
