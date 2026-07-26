import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, RefreshCw, CheckCircle2, Play, Plus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import axios from 'axios';
import { toast } from 'sonner';

interface AIRecommendation {
  name: string;
  reason: string;
}

export const ArtistDiscoveryAI: React.FC = () => {
  const navigate = useNavigate();
  const { artists, recentlyPlayed, followedUserIds, toggleFollowUser } = useAudio();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchRecommendations = async () => {
    if (!artists || artists.length === 0) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Gather some play history context. We map recently played tracks to their artist names.
      const playHistoryContext = recentlyPlayed.map(track => track.artist).slice(0, 20);
      
      const response = await axios.post('/api/gemini/artist-discovery', {
        playHistory: playHistoryContext,
        allArtists: artists.map(a => ({ name: a.name, uid: a.uid }))
      });
      
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error("Failed to fetch AI recommendations:", error);
      setHasError(true);
      toast.error("Failed to get AI recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (artists.length > 0 && recommendations.length === 0 && !isLoading && !hasError) {
      fetchRecommendations();
    }
  }, [artists]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-background border border-primary/10 p-6">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32 text-primary" />
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Artist Discovery
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Personalized recommendations powered by Gemini based on your listening history
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Wand2 className="w-8 h-8 text-primary animate-bounce relative z-10" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Analyzing your taste profile...</p>
          </div>
        ) : hasError ? (
          <div className="text-center py-12 text-zinc-500">
            <p>Could not generate recommendations at this time.</p>
            <Button variant="link" onClick={fetchRecommendations} className="text-primary mt-2">Try Again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {recommendations.map((rec, index) => {
                const artist = artists.find(a => a.name.toLowerCase() === rec.name.toLowerCase());
                if (!artist) return null;

                const isFollowing = followedUserIds?.includes(artist.uid);

                return (
                  <motion.div
                    key={rec.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-all flex flex-col"
                  >
                    <div className="flex items-start gap-4 mb-3 cursor-pointer" onClick={() => navigate(`/artist/${artist.uid}`)}>
                      <Avatar className="h-12 w-12 border border-white/10 shrink-0">
                        <AvatarImage src={artist.avatarUrl} alt={artist.name} />
                        <AvatarFallback>{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-white text-sm truncate">{artist.name}</h3>
                          {artist.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{artist.genre || 'Web3 Artist'}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-zinc-300 bg-black/20 p-3 rounded-lg border border-white/5 flex-1 mb-4 italic leading-relaxed">
                      "{rec.reason}"
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 text-zinc-400 hover:text-white"
                        onClick={() => navigate(`/artist/${artist.uid}`)}
                      >
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        Listen
                      </Button>
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => toggleFollowUser(artist.uid)}
                      >
                        {isFollowing ? <UserCheck className="w-3.5 h-3.5 mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
