import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface GenreCardProps {
  genre: {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
  };
  onClick?: () => void;
  isSelected?: boolean;
}

const GenreCard: React.FC<GenreCardProps> = ({ genre, onClick, isSelected }) => {
  const navigate = useNavigate();
  const Icon = genre.icon;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/discover?search=${genre.name}`);
    }
  };

  return (
    <div className="relative group">
      {/* Blue gradient boundary/glow */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[4px] blur transition-opacity duration-300 ${isSelected ? 'opacity-100 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'opacity-20 group-hover:opacity-100'}`}></div>
      
      {/* Additional sharp boundary layer */}
      <div className={`absolute -inset-[2px] bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[4px] transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}></div>
      
      <button 
        onClick={handleClick}
        className={`relative w-full h-24 rounded-[4px] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 ${isSelected ? 'ring-1 ring-white/50' : ''}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          <Icon className="w-8 h-8 text-foreground/90 group-hover:text-foreground transition-colors drop-shadow-lg" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground drop-shadow-md">{genre.name}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/80 group-hover:bg-muted/90 transition-colors"></div>
      </button>
    </div>
  );
};

export default GenreCard;
