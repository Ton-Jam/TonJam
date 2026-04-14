import React from 'react';
import { UserProfile } from '@/types';
import ChartArtistCard from './ChartArtistCard';
import { ArrowRight } from 'lucide-react';

interface TopChartArtistsProps {
  artists: UserProfile[];
  title: string;
}

const TopChartArtists: React.FC<TopChartArtistsProps> = ({ artists, title }) => {
  const top4 = [...artists].slice(0, 4);

  return (
    <div className="bg-muted/50 backdrop-blur-md rounded-sm p-2 space-y-2 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-2 -mt-2 group-hover:bg-primary/20 transition-colors"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full"></div>
          <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.4em]">{title}</h3>
        </div>
        <div className="flex items-center gap-2 px-2 py-2 bg-muted/50 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Live_Feed</span>
        </div>
      </div>
      
      <div className="space-y-2 relative z-10">
        {top4.map((artist, idx) => (
          <ChartArtistCard key={`${artist.uid}-${idx}`} artist={artist} rank={idx + 1} />
        ))}
      </div>
      
      <button className="w-full py-2 text-[9px] font-bold uppercase text-muted-foreground/20 tracking-[0.3em] hover:text-primary transition-all pt-2 flex items-center justify-center gap-2 group/btn"> 
        VIEW FULL ANALYTICS <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default TopChartArtists;
