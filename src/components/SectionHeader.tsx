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
    <div className={`flex items-end justify-between mb-4 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-zinc-800 dark:text-white transition-colors leading-none font-display">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>}
      </div>
      {viewAllLink && (
        <Link 
          to={viewAllLink} 
          className="flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-muted-foreground uppercase tracking-widest hover:text-blue-500 transition-colors group"
        >
          View All
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
      {onAction && actionLabel && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors group"
        >
          {actionLabel}
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;