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
    <div className={`flex items-end justify-between mb-6 sm:mb-10 pb-4 relative ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-primary rounded-full"></div>
            <div className="w-1 h-3 bg-primary/40 rounded-full"></div>
            <div className="w-1 h-3 bg-primary/10 rounded-full"></div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 font-mono">Stream_Access_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        </div>
        <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-foreground leading-none truncate font-display">{title}</h2>
        {subtitle && <p className="text-[10px] font-bold text-muted-foreground dark:text-white/85 uppercase tracking-[0.2em] max-w-md mt-1.5">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        {viewAllLink && (
          <Link 
            to={viewAllLink} 
            className="group flex items-center gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-500 border border-transparent rounded-full text-[7.5px] sm:text-[8.5px] font-black text-white uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm"
          >
            View More
            <ChevronRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
        {onAction && actionLabel && (
          <button 
            onClick={onAction}
            className="group flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-foreground transition-all"
          >
            {actionLabel}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -bottom-[1px] left-0 w-24 h-0.5 bg-primary shadow-[0_0_10px_var(--primary)]"></div>
    </div>
  );
};

export default SectionHeader;