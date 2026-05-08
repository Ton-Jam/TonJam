import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAudio } from '@/context/AudioContext';
import { Search, Music, User, ShoppingBag, ListMusic, History, Sparkles } from 'lucide-react';
import { Track, Artist, NFTItem } from '@/types';

export function SearchCommandDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { allTracks, artists, allNFTs, playTrack } = useAudio();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 lg:right-12 z-50 flex items-center gap-2 px-4 py-3 bg-background/80 backdrop-blur-xl rounded-full shadow-2xl hover:bg-muted transition-all group scale-90 sm:scale-100"
      >
        <Search className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-4">Quick Search</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a track, artist or NFT protocol..." />
        <CommandList>
          <CommandEmpty>No signals detected.</CommandEmpty>
          
          <CommandGroup heading="Recent Frequencies">
             <CommandItem onSelect={() => handleSelect(() => navigate('/discover'))}>
              <History className="mr-2 h-4 w-4" />
              <span>Full Search History</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />

          <CommandGroup heading="Active Tracks">
            {allTracks.slice(0, 5).map((track) => (
              <CommandItem 
                key={track.id} 
                onSelect={() => handleSelect(() => playTrack(track))}
              >
                <Music className="mr-2 h-4 w-4 text-blue-500" />
                <div className="flex flex-col">
                  <span className="font-bold">{track.title}</span>
                  <span className="text-[10px] opacity-60 uppercase">{track.artist}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Verified Artists">
            {artists.slice(0, 5).map((artist) => (
              <CommandItem 
                key={artist.uid} 
                onSelect={() => handleSelect(() => navigate(`/artist/${artist.uid}`))}
              >
                <User className="mr-2 h-4 w-4 text-purple-500" />
                <span>{artist.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="NFT Assets">
            {allNFTs.slice(0, 5).map((nft) => (
              <CommandItem 
                key={nft.id} 
                onSelect={() => handleSelect(() => navigate(`/nft/${nft.id}`))}
              >
                <ShoppingBag className="mr-2 h-4 w-4 text-emerald-500" />
                <span>{nft.title}</span>
                <span className="ml-auto text-[10px] font-mono">{nft.price} TON</span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="System Nodes">
            <CommandItem onSelect={() => handleSelect(() => navigate('/marketplace'))}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Marketplace</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => navigate('/jamspace'))}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>JamSpace</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => navigate('/library'))}>
              <ListMusic className="mr-2 h-4 w-4" />
              <span>Library</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
