import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  heading?: string;
  supportingText?: string;
  buttonText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = CheckCircle2,
  heading = "You're all caught up.",
  supportingText = "Updates from artists, listeners, and your music community will appear here.",
  buttonText = "Explore TonJam",
  onAction,
}) => {
  return (
    <div className="w-full py-12 px-6 rounded-3xl bg-[#111C30]/50 flex flex-col items-center justify-center text-center space-y-3 select-none">
      <div className="w-14 h-14 rounded-2xl bg-[#2E8CEB]/10 text-[#2E8CEB] flex items-center justify-center mb-1">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-[#F5F7FB] tracking-tight">
        {heading}
      </h3>

      <p className="text-xs text-[#91A8C5] max-w-xs leading-relaxed">
        {supportingText}
      </p>

      {buttonText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 px-5 py-2.5 rounded-xl bg-[#2E8CEB] hover:bg-[#2577c9] active:scale-95 text-white text-xs font-bold transition-all shadow-md"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
