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
        
        <SheetHeader className="p-8 border-b border-white/5 relative bg-background/50 backdrop-blur-xl">
          <SheetTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Filter className="h-6 w-6 text-blue-500" />
            Signal Filters
          </SheetTitle>
          <SheetDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">
            Refine your sensory exploration parameters
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-8">
          <div className="space-y-10">
            {/* Search Input inside Filters (Optional but requested pattern usually) */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Query Identification</Label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Filter parameters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Category Filter */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Dimension</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Signals', icon: Zap },
                  { id: 'tracks', label: 'Tracks', icon: Music2 },
                  { id: 'artists', label: 'Artists', icon: Users },
                  { id: 'nfts', label: 'NFT Artifacts', icon: ShoppingBag }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 justify-center",
                      activeFilter === cat.id 
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Sorting Section */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Sort Protocol</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'newest', label: 'Newest', icon: Clock3 },
                  { id: 'popular', label: 'Popular', icon: Zap },
                  { id: 'price-low', label: 'Price Low', icon: ArrowDown },
                  { id: 'price-high', label: 'Price High', icon: ArrowUp }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortOption(opt.id)}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 justify-center",
                      sortOption === opt.id 
                        ? "bg-white/10 border-white/20 text-white" 
                        : "bg-transparent border-white/5 text-white/40 hover:border-white/10"
                    )}
                  >
                    <opt.icon className="h-3 w-3" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {filters?.priceRange && filters.setPriceRange && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Price Range (TON)</Label>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
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
                    className="py-4"
                  />
                </div>
              </>
            )}

            {filters?.bpmRange && filters.setBpmRange && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Tempo (BPM)</Label>
                    <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
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
                    className="py-4"
                  />
                </div>
              </>
            )}

            {filters?.setRarity && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Artifact Rarity</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['All', 'Unique', 'Rare', 'Limited', 'Common'].map((rarity) => (
                      <button
                        key={rarity}
                        onClick={() => filters.setRarity!(rarity)}
                        className={cn(
                          "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          filters.rarity === rarity 
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/5" 
                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        {rarity}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {filters?.status !== undefined && filters.setStatus && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Listing Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['All', 'Active Auctions'].map((status) => (
                      <button
                        key={status}
                        onClick={() => filters.setStatus!(status)}
                        className={cn(
                          "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          filters.status === status 
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-500 shadow-lg shadow-purple-500/5" 
                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {filters?.selectedGenres && filters.setSelectedGenres && (
              <>
                <Separator className="bg-white/5" />
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Frequency Genres</Label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => {
                      const isSelected = filters.selectedGenres?.includes(genre.name);
                      return (
                        <Badge 
                          key={genre.id}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => {
                            if (isSelected) {
                              filters.setSelectedGenres!(filters.selectedGenres!.filter(g => g !== genre.name));
                            } else {
                              filters.setSelectedGenres!([...(filters.selectedGenres || []), genre.name]);
                            }
                          }}
                          className={cn(
                            "px-3 py-1 cursor-pointer text-[9px] font-black uppercase tracking-widest rounded-full transition-all",
                            isSelected 
                              ? "bg-blue-600 border-blue-500 text-white" 
                              : "bg-transparent border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5"
                          )}
                        >
                          {genre.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {filters?.setOnlyVerified && (
              <>
                <Separator className="bg-white/5" />
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground cursor-pointer" htmlFor="verified-filter">Verified Entities</Label>
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Only show signals from identified artists</p>
                  </div>
                  <Checkbox 
                    id="verified-filter" 
                    checked={filters.onlyVerified} 
                    onCheckedChange={(v) => filters.setOnlyVerified!(!!v)}
                    className="h-5 w-5 border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500 rounded-sm"
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-8 border-t border-white/5 bg-background relative z-10 sm:flex-row gap-3">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
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
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20"
            onClick={() => onOpenChange(false)}
          >
            Engage
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
