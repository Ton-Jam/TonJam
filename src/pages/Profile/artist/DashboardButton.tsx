import React from 'react';
import { Activity, LayoutDashboard, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface DashboardButtonProps {
  isDashboardActive: boolean;
  onToggle: () => void;
}

export const DashboardButton: React.FC<DashboardButtonProps> = ({
  isDashboardActive,
  onToggle
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 w-full">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/artist-dashboard')}
        className="flex-1 py-3 px-5 bg-[#0052FF] hover:bg-[#1a66ff] active:bg-[#0047dd] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
      >
        <LayoutDashboard className="w-4 h-4 shrink-0" />
        <span>Artist Dashboard</span>
        <ArrowRight className="w-4 h-4 shrink-0 ml-0.5" />
      </motion.button>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            isDashboardActive
              ? 'bg-blue-600/30 text-blue-300'
              : 'bg-[#101A3B] text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isDashboardActive ? 'View Profile' : 'Creator Space'}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/artist-analytics')}
          className="p-3 bg-[#101A3B] text-slate-300 hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          title="Full Analytics Insights"
        >
          <Activity className="w-4.5 h-4.5" />
        </motion.button>
      </div>
    </div>
  );
};

export default DashboardButton;
