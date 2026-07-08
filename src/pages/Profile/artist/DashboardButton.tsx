import React from 'react';
import { Activity, LayoutDashboard } from 'lucide-react';
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
    <div className="flex gap-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
          isDashboardActive
            ? 'bg-[#0052FF] text-white'
            : 'bg-[#101A3B] border border-white/5 text-slate-300 hover:text-white'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>{isDashboardActive ? 'View Profile' : 'Creator Space'}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/artist-analytics')}
        className="p-2.5 bg-[#101A3B] border border-white/5 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
        title="Full Analytics Insights"
      >
        <Activity className="w-4.5 h-4.5" />
      </motion.button>
    </div>
  );
};

export default DashboardButton;
