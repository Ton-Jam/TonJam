import React, { useMemo } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock3, Zap, ArrowDown, ArrowUp, Music2, Users, ShoppingBag, Search, Sparkles, Sliders } from 'lucide-react';
import { GENRES, MOODS } from '@/constants';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface FilterSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: any) => void;
  filters?: {
    bpmRange?: [number, number];
    setBpmRange?: (range: [number, number]) => void;
    priceRange?: [number, number];
    setPriceRange?: (range: [number, number]) => void;
    selectedGenres?: string[];
    setSelectedGenres?: (genres: string[]) => void;
    selectedMoods?: string[];
    setSelectedMoods?: (moods: string[]) => void;
    rarity?: string;
    setRarity?: (rarity: string) => void;
    status?: string;
    setStatus?: (status: string) => void;
    onlyVerified?: boolean;
    setOnlyVerified?: (verified: boolean) => void;
  };
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  isOpen,
  onOpenChange,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  filters
}) => {
  // Calculate how many parameters are customized from their default values
  const activeCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (activeFilter !== 'all') count++;
    if (sortOption !== 'newest') count++;
    if (filters) {
      if (filters.bpmRange && (filters.bpmRange[0] !== 60 || filters.bpmRange[1] !== 180)) count++;
      if (filters.priceRange && (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000)) count++;
      if (filters.selectedGenres && filters.selectedGenres.length > 0 && !filters.selectedGenres.includes('All')) count++;
      if (filters.selectedMoods && filters.selectedMoods.length > 0) count++;
      if (filters.rarity && filters.rarity !== 'All') count++;
      if (filters.status && filters.status !== 'All') count++;
      if (filters.onlyVerified) count++;
    }
    return count;
  }, [searchQuery, activeFilter, sortOption, filters]);

  // Sensory quick adjustment presets to configure multiple variables at once
  const presets = [
    {
      name: 'Cyber Rave',
      description: 'High BPM high-tempo party frequencies',
      bpms: [128, 175] as [number, number],
      genres: ['Dance', 'Electro'],
      moods: ['Hyper', 'Energetic']
    },
    {
      name: 'Deep Chill',
      description: 'Relaxed ambient vibrations and subtones',
      bpms: [60, 95] as [number, number],
      genres: ['Ambient', 'Lo-Fi'],
      moods: ['Chill', 'Dreamy']
    },
    {
      name: 'Elite artifacts',
      description: 'Unique scarcity high-tier artifacts',
      rarity: 'Unique',
      price: [150, 1000] as [number, number],
      onlyVerified: true
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    if (!filters) return;
    if (preset.bpms && filters.setBpmRange) filters.setBpmRange(preset.bpms);
    if (preset.genres && filters.setSelectedGenres) filters.setSelectedGenres(preset.genres);
    if (preset.moods && filters.setSelectedMoods) filters.setSelectedMoods(preset.moods);
    if (preset.rarity && filters.setRarity) filters.setRarity(preset.rarity);
    if (preset.price && filters.setPriceRange) filters.setPriceRange(preset.price);
    if (preset.onlyVerified !== undefined && filters.setOnlyVerified) filters.setOnlyVerified(preset.onlyVerified);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-zinc-950 p-0 overflow-hidden flex flex-col font-sans border-none shadow-2xl">
        {/* Dynamic ambient highlights without strict border lines */}
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-purple-600/10 blur-[110px] rounded-full pointer-events-none" />
        
        <SheetHeader className="p-6 relative bg-zinc-950/80 backdrop-blur-3xl">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl sm:text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-white">
              <Sliders className="h-5 w-5 text-blue-500" />
              Signal Refiner
            </SheetTitle>
            {activeCount > 0 && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/20 text-white border-none">
                {activeCount} ACTIVES
              </Badge>
            )}
          </div>
          <SheetDescription className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Fine-tune telemetry & sonic exploration parameters
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-2 relative z-10">
          <div className="space-y-6 pb-8">
            {/* Presets Subsection */}
            {filters && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Frequency Presets</Label>
                </div>
                <div className="flex flex-col gap-2">
                  {presets.map((pr) => (
                    <motion.button
                      key={pr.name}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.06)' }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => applyPreset(pr)}
                      className="p-3 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group border-none"
                    >
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block">{pr.name}</span>
                        <span className="text-[9px] text-zinc-400 font-medium tracking-wide block mt-0.5">{pr.description}</span>
                      </div>
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Input inside Filters */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Query Identification</Label>
              </div>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Filter parameters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-medium border-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Dimension</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Signals', icon: Zap },
                  { id: 'tracks', label: 'Tracks', icon: Music2 },
                  { id: 'artists', label: 'Artists', icon: Users },
                  { id: 'nfts', label: 'NFT Artifacts', icon: ShoppingBag }
                ].map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFilter(cat.id)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2 justify-center cursor-pointer whitespace-nowrap border-none",
                      activeFilter === cat.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    )}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sorting Section */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Sort Protocol</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'newest', label: 'Newest', icon: Clock3 },
                  { id: 'popular', label: 'Popular', icon: Zap },
                  { id: 'price-low', label: 'Price Low', icon: ArrowDown },
                  { id: 'price-high', label: 'Price High', icon: ArrowUp }
                ].map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSortOption(opt.id)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2 justify-center cursor-pointer border-none",
                      sortOption === opt.id 
                        ? "bg-white/10 text-white shadow-md shadow-white/5 font-black" 
                        : "bg-white/5 text-zinc-400 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <opt.icon className="h-3 w-3" />
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {filters?.priceRange && filters.setPriceRange && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Price Range (TON)</Label>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-black tracking-wide">
                    {filters.priceRange[0]} - {filters.priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 1000]}
                  max={5000}
                  min={0}
                  step={10}
                  value={filters.priceRange}
                  onValueChange={filters.setPriceRange}
                  className="py-2 cursor-pointer"
                />
              </div>
            )}

            {filters?.bpmRange && filters.setBpmRange && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Tempo (BPM)</Label>
                  </div>
                  <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-black tracking-wide">
                    {filters.bpmRange[0]} - {filters.bpmRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[60, 180]}
                  max={220}
                  min={40}
                  step={1}
                  value={filters.bpmRange}
                  onValueChange={filters.setBpmRange}
                  className="py-2 cursor-pointer"
                />
              </div>
            )}

            {filters?.setRarity && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Artifact Rarity</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Unique', 'Rare', 'Limited', 'Common'].map((rarity) => (
                    <motion.button
                      key={rarity}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => filters.setRarity!(rarity)}
                      className={cn(
                        "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-none",
                        filters.rarity === rarity 
                          ? "bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/15" 
                          : "bg-white/5 text-zinc-400 hover:bg-white/8 hover:text-white"
                      )}
                    >
                      {rarity}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {filters?.status !== undefined && filters.setStatus && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Listing Status</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Active Auctions'].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => filters.setStatus!(status)}
                      className={cn(
                        "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-none",
                        filters.status === status 
                          ? "bg-purple-500/10 text-purple-400 shadow-lg shadow-purple-500/15" 
                          : "bg-white/5 text-zinc-400 hover:bg-white/8 hover:text-white"
                      )}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {filters?.selectedGenres && filters.setSelectedGenres && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Frequency Genres</Label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Badge 
                      variant={(filters.selectedGenres?.includes('All') || !filters.selectedGenres || filters.selectedGenres.length === 0) ? "default" : "outline"}
                      onClick={() => {
                        filters.setSelectedGenres!(['All']);
                      }}
                      className={cn(
                        "px-2.5 py-1 cursor-pointer text-[8px] font-black uppercase tracking-widest rounded-full transition-all border-none shadow-none",
                        (filters.selectedGenres?.includes('All') || !filters.selectedGenres || filters.selectedGenres.length === 0)
                          ? "bg-blue-600 text-white" 
                          : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      All
                    </Badge>
                  </motion.div>
                  {GENRES.map((genre) => {
                    const isSelected = filters.selectedGenres?.includes(genre.name) && !filters.selectedGenres?.includes('All');
                    return (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={genre.id} className="inline-block">
                        <Badge 
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => {
                            if (isSelected) {
                              filters.setSelectedGenres!(['All']);
                            } else {
                              filters.setSelectedGenres!([genre.name]);
                            }
                          }}
                          className={cn(
                            "px-2.5 py-1 cursor-pointer text-[8px] font-black uppercase tracking-widest rounded-full transition-all border-none shadow-none",
                            isSelected 
                              ? "bg-blue-600 text-white" 
                              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {genre.name}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {filters?.selectedMoods && filters.setSelectedMoods && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-100">Mood Exploration</Label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.map((mood) => {
                    const isSelected = filters.selectedMoods?.includes(mood.name);
                    return (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={mood.id} className="inline-block">
                        <Badge 
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => {
                            if (isSelected) {
                              filters.setSelectedMoods!(filters.selectedMoods!.filter(m => m !== mood.name));
                            } else {
                              filters.setSelectedMoods!([...(filters.selectedMoods || []), mood.name]);
                            }
                          }}
                          className={cn(
                            "px-2.5 py-1 cursor-pointer text-[8px] font-black uppercase tracking-widest rounded-full transition-all border-none shadow-none",
                            isSelected 
                              ? "bg-purple-600 text-white" 
                              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {mood.name}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {filters?.setOnlyVerified && (
              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl hover:bg-white/[0.08] transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-100 cursor-pointer" htmlFor="verified-filter">Verified Entities</Label>
                  <p className="text-[8px] text-zinc-400 font-semibold uppercase tracking-wider">Only show signals from identified artists</p>
                </div>
                <Checkbox 
                  id="verified-filter" 
                  checked={filters.onlyVerified} 
                  onCheckedChange={(v) => filters.setOnlyVerified!(!!v)}
                  className="h-4.5 w-4.5 border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500 rounded-sm"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 bg-zinc-950/95 backdrop-blur-3xl relative z-10 flex flex-row gap-2">
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              className="w-full rounded-xl text-[9px] font-black uppercase tracking-widest h-10 hover:bg-white/5 text-zinc-400 hover:text-white cursor-pointer border-none"
              onClick={() => {
                setSortOption('newest');
                setActiveFilter('all');
                setSearchQuery('');
                if (filters) {
                  filters.setBpmRange?.([60, 180]);
                  filters.setPriceRange?.([0, 1000]);
                  filters.setSelectedGenres?.([]);
                  filters.setSelectedMoods?.([]);
                  filters.setRarity?.('All');
                  filters.setOnlyVerified?.(false);
                }
              }}
            >
              Reset
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest h-10 shadow-lg shadow-blue-600/20 cursor-pointer border-none"
              onClick={() => onOpenChange(false)}
            >
              Engage
            </Button>
          </motion.div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
