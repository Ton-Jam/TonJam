import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingsItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  onClick?: () => void;
  type?: 'toggle' | 'link';
  value?: boolean;
  onToggle?: (val: boolean) => void;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  type = 'link', 
  value, 
  onToggle 
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-[var(--surface)] hover:bg-[var(--surface-hover)] rounded-xl transition-all border border-[var(--border)]"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
          {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
        </div>
      </div>
      {type === 'link' && <ChevronRight size={18} className="text-[var(--text-muted)]" />}
      {type === 'toggle' && (
        <div 
          className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${value ? 'bg-[var(--primary)] justify-end' : 'bg-[var(--border)] justify-start'}`}
          onClick={(e) => { e.stopPropagation(); onToggle?.(!value); }}
        >
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
      )}
    </button>
  );
};
