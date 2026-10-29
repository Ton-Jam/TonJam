import React from 'react';

interface SectionHeadingProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  count?: number;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  actionText,
  onAction,
  count,
}) => {
  return (
    <div className="flex items-center justify-between px-1 pt-4 pb-2 select-none">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#91A8C5]">
          {title}
        </h2>
        {typeof count === 'number' && (
          <span className="text-[11px] font-semibold text-slate-400 font-mono">
            ({count})
          </span>
        )}
      </div>

      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-bold text-[#2E8CEB] hover:text-[#2577c9] transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default SectionHeading;
