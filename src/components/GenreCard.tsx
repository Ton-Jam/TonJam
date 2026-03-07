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
    <button 
      onClick={handleClick}
      className={`relative h-24 rounded-[10px] overflow-hidden group transition-all hover:scale-[1.02] active:scale-95 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black' : ''}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-10">
        <Icon className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">{genre.name}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
    </button>
  );
};

export default GenreCard;
