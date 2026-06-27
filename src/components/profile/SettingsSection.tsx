import React from 'react';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-widest pl-1">{title}</h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);
