import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, viewAllLink, onAction, actionLabel, className = "" }) => {
  return (
    <div className={`flex items-end justify-between mb-6 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold uppercase tracking-tighter text-white leading-none">{title}</h2>
        {subtitle && <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{subtitle}</p>}
      </div>
      {viewAllLink && (
        <Link 
          to={viewAllLink} 
          className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors group"
        >
          View All
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
      {onAction && actionLabel && (
        <button 
          onClick={onAction}
          className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors group"
        >
          {actionLabel}
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;