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
    return { type: 'stable', percentage: 0, icon: Minus, color: 'text-muted-foreground/30', bgColor: 'bg-muted/5' };
  };

  return (
    <div className={cn("w-full py-2", className)}>
      <div className="pb-4 pt-2">
        <div className="flex items-center justify-between animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="text-primary p-2 bg-primary/10 rounded-2xl">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-display">
                  {title}
                </h2>
                <p className="text-[10px] font-bold tracking-tight text-neutral-500 uppercase">
                  Consensus Network Standing
                </p>
              </div>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground bg-muted/30 rounded-full">
                  <Info className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-950 border-none text-[10px] font-bold uppercase tracking-widest p-4 max-w-[240px] rounded-2xl shadow-3xl text-zinc-300">
                Earnings are synthesized from NFT primary logic, streaming micro-royalties, and license fees via TON blockchain consensus.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="p-0">
        <Tabs defaultValue="all-time" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-0 pb-6">
            <TabsList className="grid w-full grid-cols-3 bg-neutral-100 dark:bg-zinc-900 h-10 p-1 rounded-full border border-neutral-200 dark:border-none">
              {['24h', '7d', 'all-time'].map((time) => (
                <TabsTrigger 
                  key={time} 
                  value={time}
                  className="text-[9px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full transition-all duration-300 cursor-pointer"
                >
                  {time}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-1.5 px-0 pb-6">
              <AnimatePresence mode="popLayout">
                {rankedArtists.map((artist, index) => {
                  const rank = index + 1;
                  const trend = getTrend(artist);
                  
                  return (
                    <motion.div
                      key={`${artist.uid}-${activeTab}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex items-center gap-3 py-3.5 px-3 hover:bg-neutral-100/70 dark:hover:bg-white/5 transition-all rounded-2xl cursor-pointer"
                    >
                      {/* Rank Indicator */}
                      <div className="w-8 flex-shrink-0 flex items-center justify-center">
                        {rank === 1 ? (
                          <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center">
                              <Award className="w-4.5 h-4.5 text-yellow-500 animate-bounce" style={{ animationDuration: '3s' }} />
                            </div>
                            <motion.div 
                              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.3, 1] }}
                              transition={{ duration: 3, repeat: Infinity }}
                              className="absolute inset-0 bg-yellow-500/10 blur-lg -z-10 rounded-full"
                            />
                          </div>
                        ) : rank <= 3 ? (
                          <div className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-full font-black text-[10px] border",
                            rank === 2 
                              ? "bg-slate-200/50 dark:bg-zinc-900 border-neutral-300 dark:border-white/5 text-slate-500 dark:text-slate-300" 
                              : "bg-amber-100/50 dark:bg-zinc-900 border-amber-200 dark:border-white/5 text-amber-700 dark:text-amber-500"
                          )}>
                            {rank}
                          </div>
                        ) : (
                          <span className="text-[10px] font-black tracking-tighter text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                            #{rank.toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      {/* Identity */}
                      <Link to={`/artist/${artist.uid}`} className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative">
                          <Avatar className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-none shadow-md group-hover:scale-105 transition-all duration-300">
                            <AvatarImage src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-muted text-primary font-black text-[10px]">
                              {artist.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-foreground truncate group-hover:text-primary transition-colors leading-tight font-display">
                            {artist.name.replace('//', '')}
                          </h4>
                          <div className="hidden sm:flex items-center gap-1.5 opacity-60">
                             <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
                               LVL.{(artist.uid.length % 50) + 1}
                             </span>
                             <div className="w-1 h-1 rounded-full bg-primary/40" />
                             <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                               VLD_ID: {artist.uid.slice(0, 4).toUpperCase()}
                             </span>
                          </div>
                        </div>
                      </Link>

                      {/* Trends (Desktop) */}
                      <div className="hidden sm:flex flex-col items-end gap-0 min-w-[70px]">
                        <div className={cn("flex items-center gap-0.5 text-[10px] font-black uppercase tracking-widest", trend.color)}>
                          {trend.type !== 'stable' ? (
                            <>
                              {trend.type === 'up' ? '+' : '-'}{trend.percentage}%
                              {trend.type === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            </>
                          ) : <Minus className="h-3 w-3 opacity-20" />}
                        </div>
                        <p className="text-[7.5px] font-bold text-muted-foreground/30 uppercase tracking-widest">Velocity</p>
                      </div>

                      {/* Earnings */}
                      <div className="text-right min-w-[60px] sm:min-w-[70px]">
                        <div className="flex items-center justify-end gap-0.5 flex-nowrap">
                          <span className="text-11px sm:text-xs font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                            {artist.earnings?.total.toLocaleString(undefined, { minimumFractionDigits: 1 }) || '0.0'}
                          </span>
                          <img src={TON_LOGO} alt="TON" className="w-2.5 h-2.5 opacity-85 dark:invert-0 light:invert" />
                        </div>
                        <p className="text-[6.5px] sm:text-[7.5px] font-bold uppercase tracking-widest text-muted-foreground/45 mt-0.5">Credits</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        <div className="px-0 py-6 bg-transparent">
          <Button 
            variant="ghost" 
            className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-zinc-900 h-12 transition-all gap-3 rounded-2xl group/btn cursor-pointer"
          >
            <span>View More</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:shadow-[0_0_10px_var(--primary)] transition-shadow" />
            <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
