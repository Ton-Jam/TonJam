import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Heart, Disc, Radio, Library, Music2, Star } from 'lucide-react';

interface QuickAccessItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  imageUrl?: string;
}

export const HomeQuickAccess: React.FC = () => {
  const navigate = useNavigate();

  const items: QuickAccessItem[] = [
    { 
      id: 'favorites', 
      title: 'Liked Songs', 
      icon: <Heart className="w-5 h-5 text-white" fill="currentColor" />, 
      color: 'bg-gradient-to-br from-indigo-600 to-purple-600', 
      link: '/favorite-tracks' 
    },
    { 
      id: 'library', 
      title: 'Your Library', 
      icon: <Library className="w-5 h-5 text-white" />, 
      color: 'bg-gradient-to-br from-blue-600 to-cyan-600', 
      link: '/library' 
    },
    { 
      id: 'radio', 
      title: 'Jam Radio', 
      icon: <Radio className="w-5 h-5 text-white" />, 
      color: 'bg-gradient-to-br from-emerald-600 to-teal-600', 
      link: '/jamspace' 
    },
    { 
      id: 'mint', 
      title: 'Mint Genesis', 
      icon: <Disc className="w-5 h-5 text-white" />, 
      color: 'bg-gradient-to-br from-orange-600 to-amber-600', 
      link: '/genesis-forge' 
    },
    { 
      id: 'tasks', 
      title: 'Daily Rewards', 
      icon: <Star className="w-5 h-5 text-white" />, 
      color: 'bg-gradient-to-br from-pink-600 to-rose-600', 
      link: '/tasks' 
    },
    { 
      id: 'new', 
      title: 'New Drops', 
      icon: <Music2 className="w-5 h-5 text-white" />, 
      color: 'bg-gradient-to-br from-violet-600 to-fuchsia-600', 
      link: '/marketplace' 
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-4 mb-8">
      {items.map((item) => (
        <motion.button
          key={item.id}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(item.link)}
          className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-[12px] p-2 pr-4 text-left transition-all group h-14 overflow-hidden relative"
        >
          <div className={`${item.color} w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 shadow-lg`}>
            {item.icon}
          </div>
          <span className="text-xs font-black uppercase tracking-tight text-white/90 group-hover:text-white truncate">
            {item.title}
          </span>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      ))}
    </div>
  );
};
