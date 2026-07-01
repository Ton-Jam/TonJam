import React, { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Users, Search, MoreHorizontal, UserPlus, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ARTISTS } from '@/constants';
import ArtistOptionsModal from '@/components/ArtistOptionsModal';
import { Artist } from '@/types';

const FavoriteArtists: React.FC = () => {
  const { followedUserIds, setHeaderTitle } = useAudio();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  useEffect(() => {
    setHeaderTitle('Favorite Artists');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  const followedArtists = MOCK_ARTISTS.filter(a => 
    followedUserIds.includes(a.uid) && 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <main className="px-2 py-4 sm:px-4 max-w-full">
        <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                {followedArtists.length} Nodes in your inner circle
            </p>
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.input 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text" 
                    placeholder="Search Artists..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        const q = searchQuery.trim();
                        const saved = localStorage.getItem('tonjam_search_history') || localStorage.getItem('recentSearches');
                        const curr = saved ? JSON.parse(saved) : [];
                        const updated = [q, ...curr.filter((h: string) => h !== q)].slice(0, 10);
                        localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
                        localStorage.setItem('recentSearches', JSON.stringify(updated));
                      }
                    }}
                    className="bg-white/[0.03] border border-white/5 rounded-full py-2 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-muted-foreground/20 uppercase font-bold tracking-widest"
                  />
                )}
              </AnimatePresence>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
        </div>

        <div className="space-y-1">
          {followedArtists.length > 0 ? (
            followedArtists.map((artist, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={artist.uid}
                className="group flex items-center justify-between p-3 rounded-[4px] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer border-b border-white/5 hover:border-emerald-500/10"
                onClick={() => navigate(`/artist/${artist.uid}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/5 group-hover:border-emerald-500/40 transition-colors bg-muted/20">
                    <img src={artist.avatarUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                      {artist.name}
                      {artist.verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                    </h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        {artist.followers.toLocaleString()} Followers
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1 h-6 font-black uppercase text-[8px] tracking-widest border border-emerald-500/20">
                    Following
                  </Button>
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8"
                     onClick={(e) => {
                       e.stopPropagation();
                       setSelectedArtist(artist);
                     }}
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-dashed border-white/10">
                <UserPlus className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Deserted Radius</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-xs mx-auto opacity-50">
                No entities detected in your tracked circle. Scan the discovery networks for new nodes.
              </p>
              <Button 
                 variant="outline" 
                 onClick={() => navigate('/discover')}
                 className="mt-6 rounded-full border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest px-8"
              >
                Scan Entities
              </Button>
            </div>
          )}
        </div>
      </main>
      <ArtistOptionsModal 
        artist={selectedArtist} 
        onClose={() => setSelectedArtist(null)} 
      />
    </div>
  );
};

export default FavoriteArtists;
