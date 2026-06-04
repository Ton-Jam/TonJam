import React from 'react';
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Clock3, Zap, ArrowDown, ArrowUp, Music2, Users, ShoppingBag, Search } from 'lucide-react';
import { GENRES, MOODS } from '@/constants';
import { cn } from '@/lib/utils';

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

import { motion, AnimatePresence } from 'motion/react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-white/10 p-0 overflow-hidden flex flex-col font-ui">
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
        
        <SheetHeader className="p-4 sm:p-6 border-b border-white/5 relative bg-background/50 backdrop-blur-xl">
          <SheetTitle className="text-xl sm:text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-500" />
            Signal Filters
          </SheetTitle>
          <SheetDescription className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] mt-1">
            Refine your sensory exploration parameters
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-6 sm:space-y-8">
            {/* Search Input inside Filters */}
            <div className="space-y-2.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Query Identification</Label>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Filter parameters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Category Filter */}
            <div className="space-y-2.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Dimension</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Signals', icon: Zap },
                  { id: 'tracks', label: 'Tracks', icon: Music2 },
                  { id: 'artists', label: 'Artists', icon: Users },
                  { id: 'nfts', label: 'NFT Artifacts', icon: ShoppingBag }
                ].map((cat) => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    onClick={() => setActiveFilter(cat.id)}
                    className={cn(
                      "h-9 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 justify-center cursor-pointer w-full",
                      activeFilter === cat.id 
                        ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-600/30" 
                        : "bg-transparent border-blue-500/30 hover:border-blue-400 text-muted-foreground hover:bg-blue-500/10 hover:text-white shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                    )}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Sorting Section */}
            <div className="space-y-2.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Sort Protocol</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'newest', label: 'Newest', icon: Clock3 },
                  { id: 'popular', label: 'Popular', icon: Zap },
                  { id: 'price-low', label: 'Price Low', icon: ArrowDown },
                  { id: 'price-high', label: 'Price High', icon: ArrowUp }
                ].map((opt) => (
                  <Button
                    key={opt.id}
                    variant="outline"
                    onClick={() => setSortOption(opt.id)}
                    className={cn(
                      "h-9 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 justify-center cursor-pointer w-full",
                      sortOption === opt.id 
                        ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-600/30" 
                        : "bg-transparent border-blue-500/30 hover:border-blue-400 text-muted-foreground hover:bg-blue-500/10 hover:text-white shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                    )}
                  >
                    <opt.icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {filters?.priceRange && filters.setPriceRange && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Price Range (TON)</Label>
                    <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
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
                    className="py-2"
                  />
                </div>
              </>
            )}

            {filters?.bpmRange && filters.setBpmRange && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Tempo (BPM)</Label>
                    <span className="text-[9px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
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
                    className="py-2"
                  />
                </div>
              </>
            )}

            {filters?.setRarity && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Artifact Rarity</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['All', 'Unique', 'Rare', 'Limited', 'Common'].map((rarity) => (
                      <Button
                        key={rarity}
                        variant="outline"
                        onClick={() => filters.setRarity!(rarity)}
                        className={cn(
                          "h-9 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border flex items-center justify-center cursor-pointer w-full",
                          filters.rarity === rarity 
                            ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-600/30" 
                            : "bg-transparent border-blue-500/30 hover:border-blue-400 text-muted-foreground hover:bg-blue-500/10 hover:text-white shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                        )}
                      >
                        {rarity}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {filters?.status !== undefined && filters.setStatus && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Listing Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['All', 'Active Auctions'].map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        onClick={() => filters.setStatus!(status)}
                        className={cn(
                          "h-9 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border flex items-center justify-center cursor-pointer w-full",
                          filters.status === status 
                            ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-600/30" 
                            : "bg-transparent border-blue-500/30 hover:border-blue-400 text-muted-foreground hover:bg-blue-500/10 hover:text-white shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                        )}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {filters?.selectedGenres && filters.setSelectedGenres && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Frequency Genres</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map((genre) => {
                      const isSelected = filters.selectedGenres?.includes(genre.name);
                      return (
                        <Button 
                          key={genre.id}
                          variant="outline"
                          onClick={() => {
                            if (isSelected) {
                              filters.setSelectedGenres!(filters.selectedGenres!.filter(g => g !== genre.name));
                            } else {
                              filters.setSelectedGenres!([...(filters.selectedGenres || []), genre.name]);
                            }
                          }}
                          className={cn(
                            "px-3 h-7 cursor-pointer text-[8px] font-black uppercase tracking-widest rounded-full transition-all border",
                            isSelected 
                              ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-600/30" 
                              : "bg-transparent border-blue-500/30 hover:border-blue-400 text-muted-foreground hover:bg-blue-500/10 hover:text-white shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                          )}
                        >
                          {genre.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {filters?.selectedMoods && filters.setSelectedMoods && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-foreground">Mood Exploration</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((mood) => {
                      const isSelected = filters.selectedMoods?.includes(mood.name);
                      return (
                        <Button 
                          key={mood.id}
                          variant="outline"
                          onClick={() => {
                            if (isSelected) {
                              filters.setSelectedMoods!(filters.selectedMoods!.filter(m => m !== mood.name));
                            } else {
                              filters.setSelectedMoods!([...(filters.selectedMoods || []), mood.name]);
                            }
                          }}
                          className={cn(
                            "px-3 h-7 cursor-pointer text-[8px] font-black uppercase tracking-widest rounded-full transition-all border",
                            isSelected 
                              ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-600/30" 
                              : "bg-transparent border-blue-500/30 hover:border-blue-400 text-muted-foreground hover:bg-blue-500/10 hover:text-white shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                          )}
                        >
                          {mood.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {filters?.setOnlyVerified && (
              <>
                <Separator className="bg-white/5" />
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-foreground cursor-pointer" htmlFor="verified-filter">Verified Entities</Label>
                    <p className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">Only show signals from identified artists</p>
                  </div>
                  <Checkbox 
                    id="verified-filter" 
                    checked={filters.onlyVerified} 
                    onCheckedChange={(v) => filters.setOnlyVerified!(!!v)}
                    className="h-4.5 w-4.5 border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500 rounded-sm"
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 sm:p-6 border-t border-white/5 bg-background relative z-10 sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest h-10 border-none"
            onClick={() => {
              setSortOption('newest');
              setActiveFilter('all');
              setSearchQuery('');
              filters?.setBpmRange?.([60, 180]);
              filters?.setPriceRange?.([0, 1000]);
              filters?.setSelectedGenres?.([]);
              filters?.setSelectedMoods?.([]);
              filters?.setRarity?.('All');
              filters?.setOnlyVerified?.(false);
            }}
          >
            Reset
          </Button>
          <Button 
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest h-10 shadow-lg shadow-blue-600/20"
            onClick={() => onOpenChange(false)}
          >
            Engage
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
