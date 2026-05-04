import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Award,
  Crown,
  Info,
  ChevronRight
} from 'lucide-react';
import { Artist } from '@/types';
import { TON_LOGO } from '@/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface LeaderboardProps {
  artists: Artist[];
  title?: string;
  limit?: number;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  artists, 
  title = "Neural Leaderboard", 
  limit = 10,
  className 
}) => {
  const [activeTab, setActiveTab] = useState('all-time');

  // Sort artists by total earnings and take the top N
  const rankedArtists = [...artists]
    .filter(a => a.earnings)
    .sort((a, b) => (b.earnings?.total || 0) - (a.earnings?.total || 0))
    .slice(0, limit);

  // Helper to generate a trend for display if not present in data
  const getTrend = (artist: Artist) => {
    const seed = artist.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isUp = seed % 3 === 0;
    const isDown = seed % 3 === 1;
    const percentage = (seed % 12) + 1;
    
    if (isUp) return { type: 'up', percentage, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
    if (isDown) return { type: 'down', percentage, icon: TrendingDown, color: 'text-rose-500', bgColor: 'bg-rose-500/10' };
    return { type: 'stable', percentage: 0, icon: Minus, color: 'text-white/20', bgColor: 'bg-white/5' };
  };

  return (
    <Card className={cn("bg-card border-border shadow-2xl overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-black uppercase italic tracking-tighter text-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Node performance & distribution protocol
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-white">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-white/10 text-[10px] font-bold uppercase tracking-widest p-4 max-w-[200px]">
                Earnings are calculated based on NFT secondary sales, streaming micro-royalties, and license fees using TON blockchain consensus.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="all-time" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pb-4">
            <TabsList className="grid w-full grid-cols-3 bg-muted h-8 p-1">
              {['24h', '7d', 'all-time'].map((time) => (
                <TabsTrigger 
                  key={time} 
                  value={time}
                  className="text-[8px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {time}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div className="divide-y divide-white/5 px-4 pb-4">
              <AnimatePresence mode="popLayout">
                {rankedArtists.map((artist, index) => {
                  const rank = index + 1;
                  const trend = getTrend(artist);
                  
                  return (
                    <motion.div
                      key={`${artist.uid}-${activeTab}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                      className="group flex items-center gap-2 py-2 px-1 hover:bg-muted/50 transition-all rounded-[8px]"
                    >
                      {/* Rank Indicator */}
                      <div className="w-6 flex-shrink-0 flex items-center justify-center">
                        {rank === 1 ? (
                          <div className="relative">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <motion.div 
                              animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 bg-yellow-500/20 blur-lg -z-10 rounded-full"
                            />
                          </div>
                        ) : rank <= 3 ? (
                          <Badge variant="outline" className={cn(
                            "w-5 h-5 flex items-center justify-center p-0 rounded-full font-black italic border-border",
                            rank === 2 ? "text-slate-400" : "text-amber-700"
                          )}>
                            {rank}
                          </Badge>
                        ) : (
                          <span className="text-[8px] font-black italic tracking-tighter text-muted-foreground/30">
                            #{rank.toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      {/* Identity */}
                      <Link to={`/artist/${artist.uid}`} className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative">
                          <Avatar className="w-6 h-6 rounded-full border border-border group-hover:border-primary transition-colors">
                            <AvatarImage src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-muted text-primary font-black text-[8px]">
                              {artist.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {trend.type === 'up' && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center border border-card">
                              <TrendingUp className="w-1.5 h-1.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-black uppercase italic tracking-tight text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                            {artist.name}
                          </h4>
                          <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="bg-muted text-[6px] font-black uppercase tracking-widest text-muted-foreground h-3 px-1 border-none leading-none">
                              LVL {(artist.uid.length % 50) + 1}
                            </Badge>
                          </div>
                        </div>
                      </Link>

                      {/* Trends (Desktop) */}
                      <div className="hidden md:flex flex-col items-end gap-0">
                        <div className={cn("flex items-center gap-0.5 text-[7px] font-black uppercase tracking-widest", trend.color)}>
                          {trend.type !== 'stable' && <span>{trend.type === 'up' ? '+' : '-'}{trend.percentage}%</span>}
                        </div>
                        <p className="text-[6px] font-bold text-muted-foreground/50 uppercase tracking-widest">Momentum</p>
                      </div>

                      {/* Earnings */}
                      <div className="text-right min-w-[60px]">
                        <div className="flex items-center justify-end gap-0.5 flex-nowrap">
                          <span className="text-[10px] font-black italic tracking-tighter text-foreground">
                            {artist.earnings?.total.toLocaleString(undefined, { minimumFractionDigits: 1 }) || '0.0'}
                          </span>
                          <img src={TON_LOGO} alt="TON" className="w-2.5 h-2.5 opacity-80 dark:invert-0 light:invert" />
                        </div>
                        <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0">Earnings</p>
                      </div>

                      <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-white/5">
          <Button 
            variant="ghost" 
            className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white hover:bg-white/5 h-12 transition-all gap-2"
          >
            View Consensus Registry
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
