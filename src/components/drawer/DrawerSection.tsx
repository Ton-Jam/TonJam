import React from 'react';

interface DrawerSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hasDivider?: boolean;
}

export const DrawerSection: React.FC<DrawerSectionProps> = ({
  title,
  children,
  className = '',
  hasDivider = false,
}) => {
  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {hasDivider && <div className="w-full h-px bg-white/[0.04] my-2" />}
      {title && (
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3.5 pt-1.5 pb-0.5 select-none">
          {title}
        </span>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
};

export default DrawerSection;
