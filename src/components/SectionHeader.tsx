import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, viewAllLink, className = "" }) => {
  return (
    <div className={`flex items-end justify-between mb-6 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold uppercase tracking-tighter text-white leading-none">{title}</h2>
        {subtitle && <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{subtitle}</p>}
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
    </div>
  );
};

export default SectionHeader;