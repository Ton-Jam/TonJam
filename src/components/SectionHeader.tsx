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

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, viewAllLink, onAction, actionLabel, className = "" }) => {
  return (
    <div className={`flex items-end justify-between mb-2 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-lg font-bold uppercase tracking-tighter text-foreground leading-none font-display">{title}</h2>
      </div>
      {viewAllLink && (
        <Link 
          to={viewAllLink} 
          className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors group"
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