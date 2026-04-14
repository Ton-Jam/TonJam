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
      {/* Unique color backdrop glow */}
      <div className={`absolute -inset-0.5 bg-gradient-to-br ${genre.color} rounded-[12px] blur opacity-40 group-hover:opacity-80 transition duration-500`}></div>
      
      <button 
        onClick={handleClick}
        className={`relative w-full h-24 rounded-[10px] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
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
